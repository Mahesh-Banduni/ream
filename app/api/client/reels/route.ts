import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { checkUserRole } from "@/app/lib/check-role";

export async function GET(request: Request) {
  try {
    const session = await checkUserRole("CLIENT");

    const reels = await prisma.reel.findMany({
      where: {
        clientId: session.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        title: true,
        audience: true,
        durationSeconds: true,
        status: true,
        hook: true,
        ending: true,
        body: true,
        reviewScore: true,
        reviewApproved: true,
        tone: true,
        keywords: true,
        voice: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            frames: true,
          },
        },

        finalReel: {
          select: {
            processingStatus: true,
            videoUrl: true,
            thumbnailUrl: true,
            duration: true,
          },
        },

        backgroundMusic: {
          select: {
            musicId: true,
            musicUrl: true,
            style_description: true,
          },
        },

        frames: {
          orderBy: {
            orderId: "asc",
          },

          select: {
            id: true,
            orderId: true,
            narration: true,
            startTime: true,
            endTime: true,
            visualDescription: true,

            _count: {
              select: {
                images: true,
                voices: true,
                videos: true,
              },
            },

            images: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                prompt: true,
                imageUrl: true,
                processingStatus: true,
                createdAt: true,
              },
            },

            voices: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                language: true,
                audioUrl: true,
                processingStatus: true,
                createdAt: true,
              },
            },

            videos: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                prompt: true,
                videoUrl: true,
                processingStatus: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reels, { status: 200 });
  } catch (error) {
    console.error("Error loading reel:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to load reel." },
      { status: 500 }
    );
  }
} 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await checkUserRole("CLIENT");

    const { title, audience, durationSeconds, tone, keywords, voice } = body;

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

    const parsedKeywords = Array.isArray(keywords)
      ? keywords.map((k: string) => String(k).trim()).filter(Boolean)
      : typeof keywords === "string"
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    // Persist to database
    const newReel = await prisma.reel.create({
      data: {
        title: title.trim(),
        audience: audience.trim(),
        durationSeconds: duration,
        tone: typeof tone === "string" && tone.trim() ? tone.trim() : null,
        keywords: parsedKeywords,
        voice: typeof voice === "string" && voice.trim() ? voice.trim() : null,
        status: "DRAFT",
        clientId: session.user.id
      },
    });

    return NextResponse.json(newReel, { status: 201 });
  } catch (error) {
    console.error("Error creating reel:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to create reel." },
      { status: 500 }
    );
  }
}
