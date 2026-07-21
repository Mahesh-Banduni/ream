import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, audience, durationSeconds } = body;

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required and must be a string." },
        { status: 400 }
      );
    }

    if (!audience || typeof audience !== "string" || !audience.trim()) {
      return NextResponse.json(
        { error: "Intended Audience is required and must be a string." },
        { status: 400 }
      );
    }

    const duration = parseInt(durationSeconds, 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        { error: "Duration must be a positive number of seconds." },
        { status: 400 }
      );
    }

    // Persist to database
    const newReel = await prisma.reel.create({
      data: {
        title: title.trim(),
        audience: audience.trim(),
        durationSeconds: duration,
        status: "DRAFT",
      },
    });

    return NextResponse.json(newReel, { status: 201 });
  } catch (error) {
    console.error("Error creating reel:", error);
    return NextResponse.json(
      { error: "Failed to create reel." },
      { status: 500 }
    );
  }
}
