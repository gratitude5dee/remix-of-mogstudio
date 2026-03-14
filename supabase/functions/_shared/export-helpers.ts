const decoder = new TextDecoder();

export interface ExportAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  subtype?: 'voiceover' | 'sfx' | 'music' | 'visual';
  url: string;
  duration_ms?: number;
  order_index: number;
  metadata?: Record<string, unknown>;
}

export interface ExportSettings {
  resolution?: string;
  fps?: number;
  codec?: string;
  quality?: string;
  includeAudio?: boolean;
}

/** Describes a shot that failed during the download/convert phase. */
export interface ShotFailure {
  assetId: string;
  orderIndex: number;
  reason: string;
}

export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await Deno.writeFile(outputPath, new Uint8Array(arrayBuffer));
}

export async function runFfmpeg(args: string[], errorLabel: string): Promise<string> {
  try {
    const command = new Deno.Command('ffmpeg', {
      args,
      stdout: 'piped',
      stderr: 'piped',
    });
    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorMsg = decoder.decode(stderr);
      console.error(`${errorLabel}: ${errorMsg}`);
      throw new Error(`${errorLabel}: ${errorMsg || 'ffmpeg exited with error'}`);
    }

    return decoder.decode(stdout);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error('FFmpeg binary not available in runtime');
    }
    throw error;
  }
}

export async function getMediaDuration(filePath: string): Promise<number> {
  try {
    const command = new Deno.Command('ffprobe', {
      args: [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ],
      stdout: 'piped',
      stderr: 'piped',
    });
    const { stdout } = await command.output();
    const duration = parseFloat(decoder.decode(stdout).trim());
    return Number.isNaN(duration) ? 5 : duration;
  } catch {
    return 5;
  }
}

export interface ProcessAssetsResult {
  publicUrl: string;
  shotFailures: ShotFailure[];
}

export async function processAssets(
  supabaseAdmin: any,
  projectId: string,
  assets: ExportAsset[],
  jobId: string,
  tempDir: string,
  exportBucket: string,
  settings: ExportSettings = {}
): Promise<ProcessAssetsResult> {
  const {
    resolution = '1920x1080',
    fps = 30,
    codec = 'libx264',
    quality = '23',
    includeAudio = true,
  } = settings;

  const [width, height] = resolution.split('x').map(Number);
  const sortedAssets = [...assets].sort((a, b) => a.order_index - b.order_index);
  const visualAssets = sortedAssets.filter((asset) => asset.type === 'image' || asset.type === 'video');
  const audioAssets = sortedAssets.filter((asset) => asset.type === 'audio');

  const visualFiles: Array<{ path: string; type: string; duration: number }> = [];
  const shotFailures: ShotFailure[] = [];

  for (let i = 0; i < visualAssets.length; i += 1) {
    const asset = visualAssets[i];
    const ext = asset.type === 'video' ? 'mp4' : 'jpg';
    const localPath = `${tempDir}/visual_${i}.${ext}`;

    if (!asset.url) {
      shotFailures.push({
        assetId: asset.id,
        orderIndex: asset.order_index,
        reason: 'Missing asset URL',
      });
      continue;
    }

    try {
      await downloadFile(asset.url, localPath);
      const duration =
        asset.type === 'video'
          ? await getMediaDuration(localPath)
          : asset.duration_ms
            ? asset.duration_ms / 1000
            : 5;

      visualFiles.push({ path: localPath, type: asset.type, duration });
    } catch (downloadError) {
      const reason =
        downloadError instanceof Error ? downloadError.message : 'Download failed';
      console.warn(`Skipping asset ${asset.id} (order ${asset.order_index}): ${reason}`);
      shotFailures.push({
        assetId: asset.id,
        orderIndex: asset.order_index,
        reason,
      });
    }

    const progress = Math.round(((i + 1) / Math.max(visualAssets.length, 1)) * 30);
    await supabaseAdmin
      .from('export_jobs')
      .update({ progress, status: 'processing' })
      .eq('id', jobId);
  }

  if (visualFiles.length === 0) {
    throw new Error(
      shotFailures.length > 0
        ? `All ${shotFailures.length} visual assets failed to download`
        : 'No visual assets available for export'
    );
  }

  const audioFiles: Array<{ path: string; subtype: string; duration: number }> = [];
  if (includeAudio) {
    for (let i = 0; i < audioAssets.length; i += 1) {
      const asset = audioAssets[i];
      if (!asset.url) continue;

      const localPath = `${tempDir}/audio_${i}.mp3`;
      await downloadFile(asset.url, localPath);
      const duration = await getMediaDuration(localPath);
      audioFiles.push({
        path: localPath,
        subtype: asset.subtype || 'music',
        duration,
      });
    }
  }

  await supabaseAdmin
    .from('export_jobs')
    .update({ progress: 40, status: 'processing' })
    .eq('id', jobId);

  const concatFilePath = `${tempDir}/concat.txt`;
  let concatContent = '';

  for (let i = 0; i < visualFiles.length; i += 1) {
    const file = visualFiles[i];
    if (file.type === 'image') {
      const segmentPath = `${tempDir}/segment_${i}.mp4`;
      await runFfmpeg(
        [
          '-y',
          '-loop',
          '1',
          '-i',
          file.path,
          '-t',
          file.duration.toString(),
          '-vf',
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
          '-c:v',
          codec,
          '-pix_fmt',
          'yuv420p',
          '-r',
          fps.toString(),
          segmentPath,
        ],
        `Failed to convert image ${i}`
      );
      concatContent += `file '${segmentPath}'\n`;
    } else {
      const scaledPath = `${tempDir}/scaled_${i}.mp4`;
      await runFfmpeg(
        [
          '-y',
          '-i',
          file.path,
          '-vf',
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
          '-c:v',
          codec,
          '-crf',
          quality,
          '-c:a',
          'aac',
          '-r',
          fps.toString(),
          scaledPath,
        ],
        `Failed to scale video ${i}`
      );
      concatContent += `file '${scaledPath}'\n`;
    }

    const progress = 40 + Math.round(((i + 1) / visualFiles.length) * 30);
    await supabaseAdmin.from('export_jobs').update({ progress }).eq('id', jobId);
  }

  await Deno.writeTextFile(concatFilePath, concatContent);
  const visualOutputPath = `${tempDir}/visual_concat.mp4`;
  await runFfmpeg(
    ['-y', '-f', 'concat', '-safe', '0', '-i', concatFilePath, '-c', 'copy', visualOutputPath],
    'Failed to concatenate visual segments'
  );

  await supabaseAdmin.from('export_jobs').update({ progress: 80 }).eq('id', jobId);

  const finalOutputPath = `${tempDir}/final_output.mp4`;
  if (audioFiles.length > 0) {
    const audioFilterParts: string[] = [];
    audioFiles.forEach((audio, i) => {
      const volume =
        audio.subtype === 'voiceover' ? 1.0 : audio.subtype === 'music' ? 0.3 : 0.5;
      audioFilterParts.push(`[${i + 1}:a]volume=${volume}[a${i}]`);
    });
    const mixInputs = audioFiles.map((_, i) => `[a${i}]`).join('');
    const filterComplex =
      audioFilterParts.join(';') +
      `;${mixInputs}amix=inputs=${audioFiles.length}:duration=longest[aout]`;

    const ffmpegArgs = [
      '-y',
      '-i',
      visualOutputPath,
      ...audioFiles.flatMap((audio) => ['-i', audio.path]),
      '-filter_complex',
      filterComplex,
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      finalOutputPath,
    ];
    await runFfmpeg(ffmpegArgs, 'Failed to mix audio');
  } else {
    await Deno.copyFile(visualOutputPath, finalOutputPath);
  }

  await supabaseAdmin.from('export_jobs').update({ progress: 90 }).eq('id', jobId);

  const finalBytes = await Deno.readFile(finalOutputPath);
  const outputFileName = `${projectId}/${jobId}/final_export_${Date.now()}.mp4`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(exportBucket)
    .upload(outputFileName, finalBytes, {
      contentType: 'video/mp4',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload final video: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(exportBucket).getPublicUrl(outputFileName);
  return { publicUrl, shotFailures };
}

