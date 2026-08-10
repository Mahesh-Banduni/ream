import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";
import { checkUserRole } from "@/app/lib/check-role";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

const VALID_SPEAKERS = new Set([
  "anushka", "abhilash", "manisha", "vidya", "arya", "karun", "hitesh", "aditya", "ritu", "priya", "neha", "rahul", "pooja", "rohan", "simran", "kavya", "amit", "dev", "ishita", "shreya", "ratan", "varun", "manan", "sumit", "roopa", "kabir", "aayan", "shubh", "ashutosh", "advait", "anand", "tanya", "tarun", "sunny", "mani", "gokul", "vijay", "shruti", "suhani", "mohit", "kavitha", "rehan", "soham", "rupali"
]);

export async function POST(req: NextRequest) {
  try {
    const {
      frame,
      language = "en-IN",
      speaker = "shubh",
    } = await req.json();
    console.log("Generating frame voice");
    await checkUserRole("CLIENT");

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

    const targetSpeaker = VALID_SPEAKERS.has(speaker?.toLowerCase())
      ? speaker.toLowerCase()
      : "shubh";

    const response = await client.textToSpeech.convert({
      model: "bulbul:v3",
      text: frame.narration,
      target_language_code: language,
      speaker: targetSpeaker,
      output_audio_codec: "mp3"
    });
    const mp3Buffer = Buffer.from(response.audios[0], "base64");

    return NextResponse.json({
      success: true,
      orderId: frame.orderId,
      narration: frame.narration,
      audio: mp3Buffer,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
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