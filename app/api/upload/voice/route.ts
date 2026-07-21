import { NextResponse } from "next/server";
import imagekit from "@/app/lib/imagekit";
import { UPLOAD_LIMITS, formatBytes } from "@/app/lib/upload_limits";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

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
    
    if (file.size > UPLOAD_LIMITS.IMAGE) {
      return NextResponse.json(
        {
          message: `Image size must be less than ${formatBytes(
            UPLOAD_LIMITS.IMAGE
          )}.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `${process.env.IMAGEKIT_FOLDER}/audio`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", error },
      { status: 500 }
    );
  }
}