import { generateGeminiImage } from "@/app/lib/gemini";
import { findImage } from "@/app/lib/image-search";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { reelId, frame } = await req.json();

    if (!frame) {
      return NextResponse.json(
        {
          error: "frame is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!frame.orderId || !frame.narration) {
      return NextResponse.json(
        {
          error: "frame.orderId and frame.narration are required.",
        },
        {
          status: 400,
        }
      );
    }

    let image = await findImage(frame.narration);

    return NextResponse.json({
        success: true,
        image
    });
}