import generateFrameAudio from "./generate-frame-audio";
import generateFrameImage from "./generate-frame-image";

const API_DELAY = 500;
import {
  Prisma,
  ProcessingStatus,
} from "@prisma/client";
import prisma from "./prisma";

interface WorkflowResult<T> {
  success: boolean;
  attempts: number;
  result?: T;
  error?: unknown;
}

interface WorkflowOptions<T> {
  maxRetries?: number;
  delayMs?: number;
  execute: () => Promise<T>;
}


const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// -----------------------------
// Generic Retry Workflow
// -----------------------------

async function executeWithRetry<T>({
  execute,
  maxRetries = 3,
  delayMs = API_DELAY,
}: WorkflowOptions<T>): Promise<WorkflowResult<T>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await execute();

      return {
        success: true,
        attempts: attempt,
        result,
      };
    } catch (err) {
      lastError = err;

      console.warn(
        `Attempt ${attempt}/${maxRetries} failed.`,
        err
      );

      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }

  return {
    success: false,
    attempts: maxRetries,
    error: lastError,
  };
}

// -----------------------------
// Agent Workflow
// -----------------------------

export async function generateAssets(reelId: string, cookie?: string) {
  const voiceRecords: Prisma.FrameVoiceCreateManyInput[] = [];
  const imageRecords: Prisma.FrameImageCreateManyInput[] = [];
  
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { voice: true },
  });

  const frames = await prisma.reelFrame.findMany({
    where: {
      reelId,
    },
    orderBy: {
      orderId: "asc",
    },
  });

  if (!frames.length) {
    throw new Error("No frames found for the reel");
  }

  const speaker = reel?.voice || "shubh";
  const results = [];

  for (const frame of frames) {
    console.log(`Processing Frame ${frame.orderId}`);

    // ---------------------
    // Audio Agent
    // ---------------------

    const audioResult = await executeWithRetry({
      maxRetries: 3,
      delayMs: 1000,
      execute: () => generateFrameAudio(frame, speaker, cookie),
    });

    if (!audioResult.success) {
      throw new Error(
        `Audio generation failed for frame ${frame.orderId}`
      );
    }

    // Small gap before next API
    await sleep(API_DELAY);

    // ---------------------
    // Image Agent
    // ---------------------

    const imageResult = await executeWithRetry({
      maxRetries: 3,
      delayMs: 1000,
      execute: () => generateFrameImage(frame, cookie),
    });

    if (!imageResult.result.success) {
      throw new Error(
        `Image generation failed for frame ${frame.orderId}`
      );
    }

    // Gap before moving to next frame
    await sleep(API_DELAY);

    voiceRecords.push({
      frameId: frame.id,
      generationAttempt: audioResult.attempts,
      processingStatus: ProcessingStatus.COMPLETED,
      language: "en-IN",
      audioUrl: audioResult.result.url,
      durationSeconds: audioResult.result.duration,
    });

    imageRecords.push({
      frameId: frame.id,
      processingStatus: ProcessingStatus.COMPLETED,
      prompt: frame.imagePrompt,
      imageUrl: imageResult.result.image.image.url
    });
  }

  let currentTime = 0;

  const frameUpdates = voiceRecords.map((voice) => {
    const duration = voice.durationSeconds ?? 0;

    const startTime = currentTime;
    const endTime = startTime + duration;

    currentTime = endTime;

    return {
      frameId: voice.frameId,
      startTime,
      endTime,
    };
  });

  return {
    voices: voiceRecords,
    images: imageRecords,
    frameUpdates: frameUpdates
  };
}