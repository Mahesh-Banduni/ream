import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const {
      frame,
      language = "en-IN",
      speaker = "shubh",
    } = await req.json();
    console.log("Generating frame voice")

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

    const response = await client.textToSpeech.convert({
      model: "bulbul:v3",
      text: frame.narration,
      target_language_code: language,
      speaker,
    });

    return NextResponse.json({
      success: true,
      orderId: frame.orderId,
      narration: frame.narration,
      audio: response.audios[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate frame voice-over.",
      },
      {
        status: 500,
      }
    );
  }
}