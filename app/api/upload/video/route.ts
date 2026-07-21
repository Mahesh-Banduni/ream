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

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { message: "Only video files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > UPLOAD_LIMITS.VIDEO) {
      return NextResponse.json(
        {
          message: `Video size must be less than ${formatBytes(
            UPLOAD_LIMITS.VIDEO
          )}.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `${process.env.IMAGEKIT_FOLDER}/videos`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", error },
      { status: 500 }
    );
  }
}