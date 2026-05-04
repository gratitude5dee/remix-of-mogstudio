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

type ContentType = "video" | "image";

type UploadIntentPayload = {
  content_type?: ContentType;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  wallet_address?: string | null;
  wallet_proof?: WalletProofPayload | null;
};

const FILE_RULES: Record<ContentType, { maxSizeBytes: number; allowedMime: RegExp; fallbackExtension: string }> = {
  image: {
    maxSizeBytes: 25 * 1024 * 1024,
    allowedMime: /^(image\/jpeg|image\/jpg|image\/png|image\/webp|image\/gif)$/i,
    fallbackExtension: "png",
  },
  video: {
    maxSizeBytes: 150 * 1024 * 1024,
    allowedMime: /^(video\/mp4|video\/quicktime|video\/webm|video\/x-matroska)$/i,
    fallbackExtension: "mp4",
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanExtension(fileName: string | null | undefined, fallback: string) {
  const raw = String(fileName || "").split(".").pop() || fallback;
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "method_not_allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as UploadIntentPayload;
    const contentType = payload.content_type;
    const walletAddress = String(payload.wallet_address || "").toLowerCase();

    if (contentType !== "image" && contentType !== "video") {
      return jsonResponse({ success: false, error: "invalid_content_type" }, 400);
    }

    if (!/^0x[a-f0-9]{40}$/i.test(walletAddress)) {
      return jsonResponse({ success: false, error: "invalid_wallet_address" }, 400);
    }

    const rules = FILE_RULES[contentType];
    const mimeType = String(payload.mime_type || "").toLowerCase();
    const sizeBytes = Number(payload.size_bytes || 0);

    if (!rules.allowedMime.test(mimeType)) {
      return jsonResponse({ success: false, error: "invalid_mime_type" }, 400);
    }

    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > rules.maxSizeBytes) {
      return jsonResponse({ success: false, error: "invalid_file_size" }, 400);
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const proofResult = await verifyAndConsumeWalletProof(supabaseAdmin, payload.wallet_proof || null);
    if (!proofResult.ok) {
      return jsonResponse({ success: false, error: proofResult.error }, proofResult.status);
    }

    if (proofResult.address !== walletAddress || proofResult.action !== `mog_upload_intent:${contentType}`) {
      return jsonResponse({ success: false, error: "wallet_proof_mismatch" }, 403);
    }

    const extension = cleanExtension(payload.file_name, rules.fallbackExtension);
    const path = `${walletAddress}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabaseAdmin.storage.from("mog-media").createSignedUploadUrl(path);

    if (error || !data?.token) {
      console.error("[mog-upload-intent] signed upload failed", error);
      return jsonResponse({ success: false, error: "signed_upload_failed" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/mog-media/${path}`;

    return jsonResponse({
      success: true,
      bucket: "mog-media",
      path,
      token: data.token,
      public_url: publicUrl,
      max_size_bytes: rules.maxSizeBytes,
      mime_type: mimeType,
    });
  } catch (error) {
    console.error("[mog-upload-intent]", error);
    return jsonResponse({ success: false, error: "internal_server_error" }, 500);
  }
});
