import {
  getSupabaseAdminClient,
  verifyAndConsumeWalletProof,
  walletProofCorsHeaders,
  WalletProofPayload,
} from "../_shared/wallet-proof.ts";

const corsHeaders = {
  ...walletProofCorsHeaders,
  "Access-Control-Allow-Headers": `${walletProofCorsHeaders["Access-Control-Allow-Headers"]}, x-idempotency-key`,
};

type GenerationType = "image" | "video";

type GeneratePayload = {
  generation_type?: GenerationType;
  prompt?: string | null;
  wallet_address?: string | null;
  source_image_data_url?: string | null;
  wallet_proof?: WalletProofPayload | null;
};

type FalQueueResponse = {
  request_id?: string;
  status?: string;
  response_url?: string;
  status_url?: string;
  images?: Array<{ url?: string; width?: number; height?: number }>;
  image?: { url?: string; width?: number; height?: number };
  video?: { url?: string; width?: number; height?: number };
  videos?: Array<{ url?: string; width?: number; height?: number }>;
  url?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractAssetUrl(payload: FalQueueResponse | null): string | null {
  if (!payload) return null;
  return (
    payload.images?.[0]?.url ||
    payload.image?.url ||
    payload.video?.url ||
    payload.videos?.[0]?.url ||
    payload.url ||
    null
  );
}

function extensionForContentType(contentType: string, generationType: GenerationType) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("quicktime")) return "mov";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("mp4")) return "mp4";
  return generationType === "video" ? "mp4" : "png";
}

async function persistGeneratedAsset({
  supabaseAdmin,
  assetUrl,
  walletAddress,
  generationType,
}: {
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>;
  assetUrl: string;
  walletAddress: string;
  generationType: GenerationType;
}) {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`fal_asset_fetch_failed_${response.status}`);
  }

  const contentType = response.headers.get("content-type") || (generationType === "video" ? "video/mp4" : "image/png");
  const bytes = new Uint8Array(await response.arrayBuffer());
  const maxBytes = generationType === "video" ? 150 * 1024 * 1024 : 25 * 1024 * 1024;
  if (bytes.byteLength <= 0 || bytes.byteLength > maxBytes) {
    throw new Error("generated_asset_size_invalid");
  }

  const extension = extensionForContentType(contentType, generationType);
  const path = `${walletAddress}/generated/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseAdmin.storage.from("mog-media").upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || "generated_asset_upload_failed");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  return {
    bucket: "mog-media",
    path,
    contentType,
    sizeBytes: bytes.byteLength,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/mog-media/${path}`,
  };
}

async function fetchFalJson(url: string, falKey: string, init?: RequestInit): Promise<FalQueueResponse> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as FalQueueResponse | null;
  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || `fal_request_failed_${response.status}`);
  }
  return payload || {};
}

async function runFalGeneration(model: string, input: Record<string, unknown>, falKey: string, maxPolls: number) {
  const submit = await fetchFalJson(`https://queue.fal.run/${model}`, falKey, {
    method: "POST",
    body: JSON.stringify(input),
  });

  const immediateUrl = extractAssetUrl(submit);
  if (immediateUrl) {
    return { result: submit, assetUrl: immediateUrl, requestId: submit.request_id || null, queued: false };
  }

  if (!submit.status_url && !submit.response_url) {
    throw new Error("fal_queue_response_missing_status_url");
  }

  let statusPayload = submit;
  for (let i = 0; i < maxPolls; i += 1) {
    await sleep(2000);
    if (submit.status_url) {
      statusPayload = await fetchFalJson(submit.status_url, falKey);
    }

    if (String(statusPayload.status || "").toUpperCase() === "COMPLETED") {
      const responseUrl = submit.response_url || statusPayload.response_url;
      if (!responseUrl) throw new Error("fal_queue_response_missing_result_url");
      const result = await fetchFalJson(responseUrl, falKey);
      const assetUrl = extractAssetUrl(result);
      if (!assetUrl) throw new Error("fal_result_missing_asset");
      return { result, assetUrl, requestId: submit.request_id || null, queued: false };
    }
  }

  return { result: statusPayload, assetUrl: null, requestId: submit.request_id || null, queued: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "method_not_allowed" }, 405);
  }

  try {
    const falKey = Deno.env.get("FAL_KEY");
    if (!falKey) {
      return jsonResponse({ success: false, error: "missing_fal_key" }, 500);
    }

    const payload = (await req.json()) as GeneratePayload;
    const generationType = payload.generation_type;
    const prompt = String(payload.prompt || "").trim();
    const walletAddress = String(payload.wallet_address || "").toLowerCase();

    if (generationType !== "image" && generationType !== "video") {
      return jsonResponse({ success: false, error: "invalid_generation_type" }, 400);
    }

    if (!prompt || prompt.length > 2000) {
      return jsonResponse({ success: false, error: "invalid_prompt" }, 400);
    }

    if (!/^0x[a-f0-9]{40}$/i.test(walletAddress)) {
      return jsonResponse({ success: false, error: "invalid_wallet_address" }, 400);
    }

    const sourceImage = String(payload.source_image_data_url || "");
    if (sourceImage && sourceImage.length > 8_000_000) {
      return jsonResponse({ success: false, error: "source_image_too_large" }, 413);
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const proofResult = await verifyAndConsumeWalletProof(supabaseAdmin, payload.wallet_proof || null);
    if (!proofResult.ok) {
      return jsonResponse({ success: false, error: proofResult.error }, proofResult.status);
    }

    if (proofResult.address !== walletAddress || proofResult.action !== `mog_generate:${generationType}`) {
      return jsonResponse({ success: false, error: "wallet_proof_mismatch" }, 403);
    }

    const imageModel = Deno.env.get("FAL_IMAGE_MODEL") || "fal-ai/nano-banana-pro";
    const videoModel = Deno.env.get("FAL_VIDEO_MODEL") || "fal-ai/kling-video/v2.6/pro/image-to-video";
    const model = generationType === "image" ? imageModel : videoModel;

    const input =
      generationType === "image"
        ? {
            prompt,
            num_images: 1,
            image_size: "portrait_16_9",
            ...(sourceImage ? { image_url: sourceImage, image_urls: [sourceImage] } : {}),
          }
        : {
            prompt,
            image_url: sourceImage,
            duration: "5",
          };

    if (generationType === "video" && !sourceImage) {
      return jsonResponse({ success: false, error: "source_image_required_for_video" }, 400);
    }

    const falResult = await runFalGeneration(model, input, falKey, generationType === "image" ? 30 : 60);
    if (falResult.queued) {
      return jsonResponse({
        success: true,
        status: "queued",
        model,
        request_id: falResult.requestId,
        message: "Generation is still processing on FAL.",
      });
    }

    const persistedAsset = await persistGeneratedAsset({
      supabaseAdmin,
      assetUrl: falResult.assetUrl!,
      walletAddress,
      generationType,
    });

    return jsonResponse({
      success: true,
      status: "completed",
      provider: "fal",
      model,
      request_id: falResult.requestId,
      asset_url: persistedAsset.publicUrl,
      asset_bucket: persistedAsset.bucket,
      asset_path: persistedAsset.path,
      asset_content_type: persistedAsset.contentType,
      asset_size_bytes: persistedAsset.sizeBytes,
    });
  } catch (error) {
    console.error("[mog-generate]", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "internal_server_error",
    }, 500);
  }
});
