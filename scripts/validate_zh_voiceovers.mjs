#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG || resolve(projectRoot, "node_modules/ffmpeg-static/ffmpeg");
const manifest = JSON.parse(await readFile(resolve(projectRoot, "videos/voiceover/zh-CN-narration.json"), "utf8"));
const buildReport = JSON.parse(await readFile(resolve(projectRoot, "videos/voiceover/build-report.json"), "utf8"));
const recordingsDirectory = resolve(projectRoot, "videos/recordings");
const voicedDirectory = resolve(recordingsDirectory, "zh-voice");
const outputPath = resolve(projectRoot, "evidence/workspace/zh-voiceover-validation.json");

function capture(command, args, allowFailure = false) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0 || allowFailure) resolvePromise({ code, stdout, stderr });
      else rejectPromise(new Error(`${command} exited ${code}: ${(stderr || stdout).slice(-2000)}`));
    });
  });
}

function parseProbe(output) {
  const durationMatch = output.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const videoMatch = output.match(/Video:\s+([^\s,]+).*?,\s+(\d+)x(\d+)\b/);
  const audioMatch = output.match(/Audio:\s+([^\s,]+).*?,\s+(\d+) Hz,\s+([^,\n]+)/);
  if (!durationMatch || !videoMatch) throw new Error(`Cannot parse media probe: ${output.slice(0, 1200)}`);
  return {
    duration: Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]),
    videoCodec: videoMatch[1],
    width: Number(videoMatch[2]),
    height: Number(videoMatch[3]),
    audioCodec: audioMatch?.[1] ?? null,
    sampleRate: audioMatch ? Number(audioMatch[2]) : null,
    channelLayout: audioMatch?.[3].trim() ?? null,
    audioLanguage: /Stream #\S+\(zho\): Audio:/.test(output) ? "zho" : null,
  };
}

async function probe(path) {
  const result = await capture(ffmpeg, ["-hide_banner", "-i", path], true);
  return parseProbe(result.stderr);
}

async function videoStreamMd5(path) {
  const result = await capture(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-i", path,
    "-map", "0:v:0", "-c", "copy", "-f", "md5", "-",
  ]);
  const match = result.stdout.match(/MD5=([a-f0-9]{32})/i);
  if (!match) throw new Error(`Cannot parse video MD5 for ${path}`);
  return match[1].toLowerCase();
}

async function loudness(path) {
  const result = await capture(ffmpeg, [
    "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0",
    "-af", "loudnorm=I=-16:LRA=7:TP=-1.5:print_format=json",
    "-f", "null", "-",
  ]);
  const matches = result.stderr.match(/\{\s*"input_i"[\s\S]*?\}/g);
  if (!matches?.length) throw new Error(`Cannot parse loudness for ${path}`);
  const parsed = JSON.parse(matches.at(-1));
  return {
    integratedLufs: Number(parsed.input_i),
    truePeakDbtp: Number(parsed.input_tp),
    loudnessRangeLu: Number(parsed.input_lra),
  };
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

const voicedFiles = (await readdir(voicedDirectory)).filter((name) => name.endsWith(".mp4")).sort();
const expectedFiles = manifest.videos.map((video) => video.file).sort();
const expectedSegmentCount = manifest.videos.reduce((sum, video) => sum + video.segments.length, 0);
const failures = [];
if (JSON.stringify(voicedFiles) !== JSON.stringify(expectedFiles)) {
  failures.push(`Voiced file set differs: expected ${expectedFiles.length}, found ${voicedFiles.length}`);
}
if (buildReport.videoCount !== manifest.videos.length || buildReport.segmentCount !== expectedSegmentCount) {
  failures.push(`Build report does not describe ${manifest.videos.length} videos and ${expectedSegmentCount} segments`);
}

const results = [];
for (const video of manifest.videos) {
  const sourcePath = resolve(recordingsDirectory, video.file);
  const voicedPath = resolve(voicedDirectory, video.file);
  const sourceInfo = await probe(sourcePath);
  const voicedInfo = await probe(voicedPath);
  const [sourceVideoMd5, voicedVideoMd5, voicedSha256, audioLoudness] = await Promise.all([
    videoStreamMd5(sourcePath),
    videoStreamMd5(voicedPath),
    sha256(voicedPath),
    loudness(voicedPath),
  ]);
  const durationDelta = Math.abs(sourceInfo.duration - voicedInfo.duration);
  const checks = {
    durationMatches: durationDelta <= 0.08,
    videoStreamMatches: sourceVideoMd5 === voicedVideoMd5,
    h264Video: voicedInfo.videoCodec === "h264",
    aacAudio: voicedInfo.audioCodec === "aac",
    sampleRate48k: voicedInfo.sampleRate === 48000,
    stereoAudio: voicedInfo.channelLayout === "stereo",
    chineseLanguageMetadata: voicedInfo.audioLanguage === "zho",
    loudnessInPresentationRange: audioLoudness.integratedLufs >= -20 && audioLoudness.integratedLufs <= -16,
    peakHasHeadroom: audioLoudness.truePeakDbtp <= -1.5,
  };
  for (const [name, passed] of Object.entries(checks)) {
    if (!passed) failures.push(`${video.file}: ${name}`);
  }
  results.push({
    file: video.file,
    sha256: voicedSha256,
    durationSeconds: voicedInfo.duration,
    durationDeltaSeconds: Number(durationDelta.toFixed(3)),
    video: {
      codec: voicedInfo.videoCodec,
      width: voicedInfo.width,
      height: voicedInfo.height,
      streamMd5: voicedVideoMd5,
      matchesSilentOriginal: sourceVideoMd5 === voicedVideoMd5,
    },
    audio: {
      codec: voicedInfo.audioCodec,
      sampleRate: voicedInfo.sampleRate,
      channelLayout: voicedInfo.channelLayout,
      language: voicedInfo.audioLanguage,
      ...audioLoudness,
    },
    checks,
  });
  console.log(`VALIDATED ${video.file}`);
}

const maximumTempo = Math.max(...buildReport.outputs.map((item) => item.maximumTempo));
if (maximumTempo > 1.35) failures.push(`Maximum tempo ${maximumTempo} exceeds 1.35`);
const report = {
  validatedAt: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS",
  videoCount: results.length,
  segmentCount: buildReport.segmentCount,
  voice: manifest.voice,
  rate: manifest.rate,
  maximumTempo,
  loudnessRangeLufs: {
    minimum: Math.min(...results.map((item) => item.audio.integratedLufs)),
    maximum: Math.max(...results.map((item) => item.audio.integratedLufs)),
  },
  failures,
  results,
};
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  report: outputPath,
  status: report.status,
  videoCount: report.videoCount,
  segmentCount: report.segmentCount,
  loudnessRangeLufs: report.loudnessRangeLufs,
  maximumTempo: report.maximumTempo,
}, null, 2));
if (failures.length) process.exit(1);
