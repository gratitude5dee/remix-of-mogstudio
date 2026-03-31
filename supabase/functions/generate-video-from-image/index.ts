import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FAL_MODELS, submitToFalQueue, FalResponse } from "../_shared/falai-client.ts";
import {
  createAssetLineage,
  createGenerationJob,
  createProjectAsset,
  createPromptVersion,
  enqueueStoryboardEvaluation,
  updateGenerationJob,
} from "../_shared/observability.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Define the expected video result structure from FAL
interface FalVideoData {
  video?: { url: string; duration?: number; frames?: number };
  url?: string;
  duration?: number;
  frames?: number;
  videos?: Array<{ url: string; duration?: number; frames?: number }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { shot_id, image_url, prompt } = await req.json();

    if (!shot_id || !image_url) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing shot ID or image URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get shot information
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select("id, project_id, scene_id, image_asset_id, visual_prompt")
      .eq("id", shot_id)
      .single();

    if (shotError || !shot) {
      console.error(`Error fetching shot: ${shotError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: shotError?.message || "Shot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Shot ${shot_id}] Starting video generation process from image.`);

    // Get the user information to associate the generation with
    const { data: authData, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.split("Bearer ")[1] || ""
    );

    if (authError || !authData.user) {
      console.error(`Error getting user: ${authError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let videoGenerationJobId: string | null = null;
    try {
      videoGenerationJobId = await createGenerationJob(supabase, {
        userId: authData.user.id,
        projectId: shot.project_id,
        jobType: 'video',
        modelId: FAL_MODELS.LTX_VIDEO_13B_DISTILLED_IMAGE_TO_VIDEO,
        status: 'running',
        inputAssets: shot.image_asset_id ? [shot.image_asset_id] : [],
        config: {
          shot_id,
          image_url,
        },
      });

      console.log(`[Shot ${shot_id}] Starting video generation with LTX Video 13B Distilled`);
      
      // Generate video from image using LTX Video 13B Distilled
      const result = await submitToFalQueue(FAL_MODELS.LTX_VIDEO_13B_DISTILLED_IMAGE_TO_VIDEO, {
        image_url: image_url,
        prompt: "Natural motion and camera movement, cinematic quality",
        negative_prompt: "worst quality, inconsistent motion, blurry, jittery, distorted",
        resolution: "720p",
        aspect_ratio: "auto",
        num_frames: 121,
        first_pass_num_inference_steps: 8,
        first_pass_skip_final_steps: 1,
        second_pass_num_inference_steps: 8,
        second_pass_skip_initial_steps: 5,
        frame_rate: 30,
        expand_prompt: false,
        reverse_video: false,
        enable_safety_checker: true,
        constant_rate_factor: 35
      }) as FalResponse<FalVideoData | string>;

      console.log(`[Shot ${shot_id}] Fal.ai response:`, JSON.stringify(result, null, 2));

      // Handle different possible response formats
      let videoUrl: string | undefined;
      let videoDuration: number | undefined;
      let videoFrames: number | undefined;

      // Check various possible response structures
      if (result.success && result.data) {
        const data = result.data;
        
        // Format 3: result.data is the video URL string
        if (typeof data === 'string' && data.startsWith('http')) {
          videoUrl = data;
        } else if (typeof data === 'object') {
          const videoData = data as FalVideoData;
          
          // Format 1: result.data.video.url
          if (videoData.video?.url) {
            videoUrl = videoData.video.url;
            videoDuration = videoData.video.duration;
            videoFrames = videoData.video.frames;
          }
          // Format 2: result.data.url (direct video URL)
          else if (videoData.url) {
            videoUrl = videoData.url;
            videoDuration = videoData.duration;
            videoFrames = videoData.frames;
          }
          // Format 4: Check if data has a videos array
          else if (videoData.videos && videoData.videos.length > 0) {
            videoUrl = videoData.videos[0].url;
            videoDuration = videoData.videos[0].duration;
            videoFrames = videoData.videos[0].frames;
          }
        }
      }

      if (!videoUrl) {
        console.error(`[Shot ${shot_id}] No video URL found in response structure:`, result);
        throw new Error(`No video URL found in Fal.ai response. Response structure: ${JSON.stringify(result)}`);
      }

      console.log(`[Shot ${shot_id}] Video URL found: ${videoUrl}`);

      // Store the generated video in Supabase storage
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video from URL: ${videoResponse.status} ${videoResponse.statusText}`);
      }
      
      const videoBuffer = await videoResponse.arrayBuffer();
      const fileName = `shot-${shot_id}-video-${Date.now()}.mp4`;
      
      const { error: uploadError } = await supabase.storage
        .from('workflow-media')
        .upload(fileName, videoBuffer, {
          contentType: 'video/mp4'
        });

      if (uploadError) {
        console.error(`Error uploading video: ${uploadError.message}`);
        throw new Error(`Failed to upload video: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workflow-media')
        .getPublicUrl(fileName);

      const promptVersionId = await createPromptVersion(supabase, {
        projectId: shot.project_id,
        stage: 'shot_video',
        authorType: 'system',
        text: prompt || shot.visual_prompt || 'Generate video from shot image',
        sourceEntityType: 'shot',
        sourceEntityId: shot_id,
        metadata: {
          source_image_url: image_url,
          model_id: FAL_MODELS.LTX_VIDEO_13B_DISTILLED_IMAGE_TO_VIDEO,
          storage_path: fileName,
        },
      });

      const videoAssetId = await createProjectAsset(supabase, {
        projectId: shot.project_id,
        userId: user.id,
        name: fileName,
        type: 'video',
        url: publicUrl,
        size: videoBuffer.byteLength,
        storageBucket: 'workflow-media',
        storagePath: fileName,
        metadata: {
          shot_id,
          storage_bucket: 'workflow-media',
          storage_path: fileName,
          duration: videoDuration ?? null,
          frames: videoFrames ?? null,
        },
      });

      // Update the shot with the video URL
      const { error: updateError } = await supabase
        .from('shots')
        .update({ 
          video_url: publicUrl,
          video_asset_id: videoAssetId,
          video_status: 'completed' 
        })
        .eq('id', shot_id);

      if (updateError) {
        console.error(`Error updating shot: ${updateError.message}`);
      }

      await createAssetLineage(supabase, {
        projectId: shot.project_id,
        promptVersionId,
        generationJobId: videoGenerationJobId,
        sourceAssetId: shot.image_asset_id ?? null,
        outputAssetId: videoAssetId,
        sceneId: shot.scene_id ?? null,
        shotId: shot_id,
        relationType: 'output',
        metadata: {
          kind: 'shot_video',
        },
      });

      await updateGenerationJob(supabase, videoGenerationJobId, {
        status: 'completed',
        progress: 100,
        result_url: publicUrl,
        result_payload: {
          shot_id,
          asset_id: videoAssetId,
          duration: videoDuration ?? null,
          frames: videoFrames ?? null,
        },
        completed_at: new Date().toISOString(),
      });

      await enqueueStoryboardEvaluation(supabase, {
        userId: authData.user.id,
        projectId: shot.project_id,
        targetType: 'shot',
        targetId: shot_id,
        sourceGenerationJobId: videoGenerationJobId,
      });

      console.log(`[Shot ${shot_id}] Video generation completed successfully`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          video_url: publicUrl,
          duration: videoDuration,
          frames: videoFrames
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Shot ${shot_id}] Error in generate-video-from-image: ${error}`);

      await supabase
        .from('shots')
        .update({
          video_status: 'failed',
          failure_reason: errorMsg,
        })
        .eq('id', shot_id);

      await updateGenerationJob(supabase, videoGenerationJobId, {
        status: 'failed',
        error_message: errorMsg,
        completed_at: new Date().toISOString(),
      });
      
      return new Response(
        JSON.stringify({ success: false, error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Unexpected error: ${errorMsg}`);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
