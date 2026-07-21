import { generateScript } from "@/app/lib/generate-script";
import { NextRequest, NextResponse } from "next/server";

interface Frame {
  orderId: number;
  frameNumber: number;
  startTime: number;
  endTime: number;
  narration: string;
  visualDescription: string;
  imagePrompt: string;
  cameraShot: string;
  cameraMovement: string;
  transition: string;
}

interface FramePlan {
  totalFrames: number;
  frames: Frame[];
}

interface GeneratedScriptResult {
  script: {
    hook: string;
    body: string;
    ending: string;
  };
  framePlan: FramePlan;
  estimatedDuration: number;
  reviewScore: number;
  reviewApproved: boolean;
  reviewFeedback: string;
  attempts: number;
}

type RouteContext = {
  params: Promise<{ reelId: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { reelId } = await context.params;

    const scriptResult: GeneratedScriptResult = await generateScript(reelId);

    return NextResponse.json(scriptResult);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate script.",
      },
      {
        status: 500,
      }
    );
  }
}
