import { NextResponse } from "next/server";
import imagekit from "@/app/lib/imagekit";
import { UPLOAD_LIMITS, formatBytes } from "@/app/lib/upload_limits";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    await checkUserRole("CLIENT");

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { message: "Only audio files are allowed" },
        { status: 400 }
      );
    }
    
    if (file.size > UPLOAD_LIMITS.AUDIO) {
      return NextResponse.json(
        {
          message: `Audio size must be less than ${formatBytes(
            UPLOAD_LIMITS.AUDIO
          )}.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `${process.env.IMAGEKIT_FOLDER}/bg_sound`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Background music upload failed:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { message: "Background music upload failed" },
      { status: 500 }
    );
  }
}
