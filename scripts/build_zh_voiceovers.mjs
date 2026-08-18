#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const manifestPath = resolve(projectRoot, "videos/voiceover/zh-CN-narration.json");
const sourceDirectory = resolve(projectRoot, "videos/recordings");
const outputDirectory = resolve(sourceDirectory, "zh-voice");
const cacheDirectory = resolve(projectRoot, "videos/voiceover/cache");
const reportPath = resolve(projectRoot, "videos/voiceover/build-report.json");
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG || resolve(projectRoot, "node_modules/ffmpeg-static/ffmpeg");
const onlyArgument = process.argv.find((argument) => argument.startsWith("--only="));
const onlyFiles = onlyArgument
  ? new Set(onlyArgument.slice("--only=".length).split(",").map((value) => value.trim()).filter(Boolean))
  : null;

function run(command, args, { capture = true } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
      child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    }
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else rejectPromise(new Error(`${command} exited ${code}: ${(stderr || stdout).slice(-4000)}`));
    });
  });
}

async function runWithRetry(command, args, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run(command, args);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 1_000));
    }
  }
  throw lastError;
}

function parseDuration(output) {
  const match = output.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Unable to parse media duration from: ${output.slice(0, 1000)}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

async function mediaInfo(path) {
  const result = await run(ffmpeg, ["-hide_banner", "-i", path]);
  return { duration: parseDuration(result.stderr), details: result.stderr };
}

async function mediaInfoAllowFailure(path) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(ffmpeg, ["-hide_banner", "-i", path], { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    child.on("error", rejectPromise);
    child.on("close", () => {
      try {
        resolvePromise({ duration: parseDuration(output), details: output });
      } catch (error) {
        rejectPromise(error);
      }
    });
  });
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const selectedVideos = manifest.videos.filter((video) => !onlyFiles || onlyFiles.has(video.file));
if (!selectedVideos.length) throw new Error("No videos selected");

for (const video of selectedVideos) {
  let previousEnd = 0;
  for (const segment of video.segments) {
    if (!(segment.start >= previousEnd && segment.end > segment.start && segment.end <= video.duration + 0.01)) {
      throw new Error(`Invalid segment timeline in ${video.file}: ${JSON.stringify(segment)}`);
    }
    previousEnd = segment.end;
  }
  const sourceInfo = await mediaInfoAllowFailure(resolve(sourceDirectory, video.file));
  if (Math.abs(sourceInfo.duration - video.duration) > 0.08) {
    throw new Error(`Duration mismatch for ${video.file}: manifest=${video.duration}, media=${sourceInfo.duration}`);
  }
}

await mkdir(outputDirectory, { recursive: true });
await mkdir(cacheDirectory, { recursive: true });

const synthesisJobs = selectedVideos.flatMap((video) => video.segments.map((segment, segmentIndex) => ({
  video,
  segment,
  segmentIndex,
})));

const synthesized = await mapWithConcurrency(synthesisJobs, 3, async ({ video, segment, segmentIndex }) => {
  const digest = createHash("sha256")
    .update(`${manifest.voice}\n${manifest.rate}\n${segment.text}`)
    .digest("hex")
    .slice(0, 16);
  const videoCache = resolve(cacheDirectory, basename(video.file, ".mp4"));
  const mediaPath = resolve(videoCache, `${String(segmentIndex + 1).padStart(2, "0")}-${digest}.mp3`);
  await mkdir(videoCache, { recursive: true });
  let cached = true;
  try {
    const fileStat = await stat(mediaPath);
    if (fileStat.size < 512) throw new Error("cache file too small");
  } catch {
    cached = false;
    await runWithRetry("uvx", [
      "--from", "edge-tts",
      "edge-tts",
      "--voice", manifest.voice,
      `--rate=${manifest.rate}`,
      "--text", segment.text,
      "--write-media", mediaPath,
    ]);
  }
  const audioInfo = await mediaInfoAllowFailure(mediaPath);
  const available = segment.end - segment.start - 0.12;
  const tempo = Math.max(1, audioInfo.duration / available);
  return {
    videoFile: video.file,
    segmentIndex,
    mediaPath,
    cached,
    audioDuration: audioInfo.duration,
    available,
    tempo,
  };
});

const tooFast = synthesized.filter((item) => item.tempo > 1.35);
if (tooFast.length) {
  console.error(JSON.stringify({
    error: "Narration segments exceed the 1.35x tempo quality gate",
    segments: tooFast.map((item) => ({
      video: item.videoFile,
      segment: item.segmentIndex + 1,
      synthesizedDuration: item.audioDuration,
      available: Number(item.available.toFixed(3)),
      requiredTempo: Number(item.tempo.toFixed(4)),
    })),
  }, null, 2));
  process.exit(1);
}

const synthesisByVideo = new Map();
for (const item of synthesized) {
  const list = synthesisByVideo.get(item.videoFile) || [];
  list.push(item);
  synthesisByVideo.set(item.videoFile, list);
}
for (const list of synthesisByVideo.values()) list.sort((a, b) => a.segmentIndex - b.segmentIndex);

const buildResults = [];
for (const video of selectedVideos) {
  const sourcePath = resolve(sourceDirectory, video.file);
  const outputPath = resolve(outputDirectory, video.file);
  const audioSegments = synthesisByVideo.get(video.file);
  const ffmpegArguments = ["-y", "-i", sourcePath];
  for (const item of audioSegments) ffmpegArguments.push("-i", item.mediaPath);

  const filters = [];
  const labels = [];
  for (let index = 0; index < audioSegments.length; index += 1) {
    const item = audioSegments[index];
    const segment = video.segments[index];
    const outputDuration = Math.min(item.audioDuration / item.tempo, item.available);
    const fadeOutStart = Math.max(0, outputDuration - 0.06);
    const delayMilliseconds = Math.round(segment.start * 1_000);
    const label = `voice${index}`;
    labels.push(`[${label}]`);
    filters.push(
      `[${index + 1}:a]aresample=48000,atempo=${item.tempo.toFixed(6)},atrim=0:${outputDuration.toFixed(3)},`
      + `afade=t=in:st=0:d=0.03,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.06,`
      + `adelay=${delayMilliseconds}:all=1[${label}]`,
    );
  }
  filters.push(
    `${labels.join("")}amix=inputs=${labels.length}:duration=longest:normalize=0,`
    + `apad=pad_dur=${video.duration},atrim=0:${video.duration},`
    + "loudnorm=I=-16:LRA=7:TP=-1.5,aresample=48000[aout]",
  );

  ffmpegArguments.push(
    "-filter_complex", filters.join(";"),
    "-map", "0:v:0",
    "-map", "[aout]",
    "-map_metadata", "0",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "160k",
    "-ar", "48000",
    "-ac", "2",
    "-metadata:s:a:0", "language=zho",
    "-metadata:s:a:0", "title=中文解说",
    "-metadata", "comment=中文配音版；无声原版保存在 videos/recordings 根目录",
    "-movflags", "+faststart",
    "-t", String(video.duration),
    outputPath,
  );

  console.log(`MUX ${video.file}`);
  await run(ffmpeg, ffmpegArguments);
  const outputInfo = await mediaInfoAllowFailure(outputPath);
  if (!/Audio:\s+aac/.test(outputInfo.details)) throw new Error(`AAC audio track missing: ${video.file}`);
  if (Math.abs(outputInfo.duration - video.duration) > 0.08) {
    throw new Error(`Output duration mismatch for ${video.file}: ${outputInfo.duration}`);
  }
  const outputStat = await stat(outputPath);
  buildResults.push({
    file: video.file,
    source: relative(projectRoot, sourcePath).replaceAll("\\", "/"),
    output: relative(projectRoot, outputPath).replaceAll("\\", "/"),
    duration: outputInfo.duration,
    bytes: outputStat.size,
    maximumTempo: Number(Math.max(...audioSegments.map((item) => item.tempo)).toFixed(4)),
    segments: audioSegments.map((item, index) => ({
      index: index + 1,
      start: video.segments[index].start,
      end: video.segments[index].end,
      text: video.segments[index].text,
      synthesizedDuration: item.audioDuration,
      tempo: Number(item.tempo.toFixed(4)),
      cached: item.cached,
    })),
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  voice: manifest.voice,
  rate: manifest.rate,
  language: manifest.language,
  videoCount: buildResults.length,
  segmentCount: buildResults.reduce((sum, video) => sum + video.segments.length, 0),
  outputs: buildResults,
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  report: reportPath,
  videoCount: report.videoCount,
  segmentCount: report.segmentCount,
  maximumTempo: Math.max(...buildResults.map((video) => video.maximumTempo)),
}, null, 2));
