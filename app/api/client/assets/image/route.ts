import { generateGeminiImage } from "@/app/lib/gemini";
import { findImage } from "@/app/lib/image-search";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try{
    const { reelId, frame } = await req.json();
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

    if (!frame.orderId || !frame.imagePrompt) {
      return NextResponse.json(
        {
          error: "frame.orderId and frame.imagePrompt are required.",
        },
        {
          status: 400,
        }
      );
    }

    let image = await findImage(frame.imagePrompt.slice(0, 100));

    return NextResponse.json({
        success: true,
        image
    });
  } 
  catch(error){
    console.error("Error in assets image route:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to search image." },
      { status: 500 }
    );
  }
}