import prisma from "./prisma";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

const API_DELAY = 500;
import {
  Prisma,
  ProcessingStatus,
} from "@prisma/client";

const voiceRecords: Prisma.FrameVoiceCreateManyInput[] = [];
const imageRecords: Prisma.FrameImageCreateManyInput[] = [];

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
// API Calls
// -----------------------------

async function generateFrameAudio(frame: { id: string; [key: string]: unknown }) {
  const res = await fetch(`${baseUrl}/api/assets/voice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ frame }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate frame audio");
  }

  const data = await res.json();

  const binary = atob(data.audio);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], {
    type: "audio/mpeg",
  });

  const file = new File([blob], `${frame.id}-voice.mp3`, {
    type: "audio/mpeg",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/upload/voice`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to generate frame audio");
  }

  return response.json();
}

async function generateFrameImage(frame: object) {
  const res = await fetch(`${baseUrl}/api/assets/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ frame }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate frame image");
  }

  return res.json();
}

// -----------------------------
// Agent Workflow
// -----------------------------

export async function generateAssets(reelId: string) {
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

  const results = [];

  for (const frame of frames) {
    console.log(`Processing Frame ${frame.orderId}`);

    // ---------------------
    // Audio Agent
    // ---------------------

    const audioResult = await executeWithRetry({
      maxRetries: 3,
      delayMs: 1000,
      execute: () => generateFrameAudio(frame),
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
      execute: () => generateFrameImage(frame),
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
      audioUrl: audioResult.result.url
    });

    imageRecords.push({
      frameId: frame.id,
      processingStatus: ProcessingStatus.COMPLETED,
      prompt: frame.imagePrompt,
      imageUrl: imageResult.result.image.image.url
    });
  }

  return {
    voices: voiceRecords,
    images: imageRecords,
  };
}