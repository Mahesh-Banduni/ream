// import { type FinalReel, type FrameImage, type FrameVideo, type FrameVoice, type ReelBackgroundMusic, type ReelStatus } from "@prisma/client";
// import prisma from "@/app/lib/prisma";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { checkUserRole } from "@/app/lib/check-role";

// type AssetStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// type ReelPreviewFrame = {
//   id: string;
//   orderId: number;
//   narration: string;
//   visualDescription: string;
//   startTime: number;
//   endTime: number;
//   imageCount: number;
//   voiceCount: number;
//   videoCount: number;
//   images: (Omit<Pick<FrameImage, "id" | "prompt" | "imageUrl" | "processingStatus" | "createdAt">, "createdAt"> & { createdAt: string })[];
//   voices: (Omit<Pick<FrameVoice, "id" | "language" | "audioUrl" | "processingStatus" | "createdAt">, "createdAt"> & { createdAt: string })[];
//   videos: (Omit<Pick<FrameVideo, "id" | "prompt" | "videoUrl" | "processingStatus" | "createdAt">, "createdAt"> & { createdAt: string })[];
// };

// type LoadedFrame = {
//   id: string;
//   startTime: number,
//   endTime: number,
//   orderId: number;
//   narration: string;
//   visualDescription: string;
//   _count: {
//     images: number;
//     voices: number;
//     videos: number;
//   };
//   images: Pick<FrameImage, "id" | "prompt" | "imageUrl" | "processingStatus" | "createdAt">[];
//   voices: Pick<FrameVoice, "id" | "language" | "audioUrl" | "processingStatus" | "createdAt">[];
//   videos: Pick<FrameVideo, "id" | "prompt" | "videoUrl" | "processingStatus" | "createdAt">[];
// };

// type LoadedReel = {
//   id: string;
//   title: string;
//   audience: string;
//   durationSeconds: number;
//   status: ReelStatus;
//   hook: string | null;
//   ending: string | null;
//   body: string | null;
//   reviewScore: number | null;
//   reviewApproved: boolean;
//   tone: string | null;
//   keywords: string[];
//   voice: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   _count: {
//     reviews: number;
//     frames: number;
//   };
//   finalReel: Pick<FinalReel, "processingStatus" | "videoUrl" | "thumbnailUrl" | "duration"> | null;
//   backgroundMusic: Pick<ReelBackgroundMusic, "musicId" | "musicUrl" | "style_description"> | null;
//   reviews: Array<{
//     overallScore: number;
//     approved: boolean;
//     feedback: string;
//   }>;
//   frames: LoadedFrame[];
// };

// export type AdminReel = {
//   id: string;
//   title: string;
//   audience: string;
//   durationSeconds: number;
//   status: ReelStatus;
//   hook: string | null;
//   ending: string | null;
//   body: string | null;
//   reviewScore: number | null;
//   reviewApproved: boolean;
//   tone: string | null;
//   keywords: string[];
//   voice: string | null;
//   createdAt: string;
//   updatedAt: string;
//   frameCount: number;
//   imageCount: number;
//   voiceCount: number;
//   videoCount: number;
//   finalReel: Pick<FinalReel, "processingStatus" | "videoUrl" | "thumbnailUrl" | "duration"> | null;
//   backgroundMusic: Pick<ReelBackgroundMusic, "musicId" | "musicUrl" | "style_description"> | null;
//   frames: ReelPreviewFrame[];
// };

// const fallbackReels: AdminReel[] = [
//   {
//     id: "sample-reel-1",
//     title: "Hook-First Startup Story",
//     audience: "Founders",
//     durationSeconds: 42,
//     status: "IMAGES_GENERATING",
//     hook: "Most startups lose viewers in the first three seconds.",
//     ending: "The best hook is the one that promises a payoff.",
//     body: "We start with a cold open, reveal the problem, and end with a clear transformation.",
//     reviewScore: 8.8,
//     reviewApproved: true,
//     tone: "Professional",
//     keywords: ["Startup", "Hook", "Growth"],
//     voice: "shubh",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     frameCount: 3,
//     imageCount: 4,
//     voiceCount: 3,
//     videoCount: 0,
//     finalReel: {
//       processingStatus: "PROCESSING",
//       videoUrl: null,
//       thumbnailUrl: null,
//       duration: 42,
//     },
//     backgroundMusic: null,
//     frames: [
//       {
//         id: "frame-1",
//         orderId: 1,
//         narration: "Start with a bold claim.",
//         visualDescription: "A founder standing in front of a data wall.",
//         startTime: 0,
//         endTime: 3,
//         imageCount: 2,
//         voiceCount: 1,
//         videoCount: 0,
//         images: [],
//         voices: [],
//         videos: [],
//       },
//     ],
//   },
// ];

// // function formatJsonText(value: unknown) {
// //   if (!value) return "";

// //   if (typeof value === "string") return value;

// //   if (Array.isArray(value)) {
// //     return value
// //       .map((item: any) =>
// //         typeof item === "object" && item !== null ? item.text : String(item)
// //       )
// //       .join(" ");
// //   }

// //   return JSON.stringify(value, null, 2);
// // }

// function summarizeFrames(frames: LoadedFrame[]) {
//   return frames.map((frame) => ({
//     id: frame.id,
//     orderId: frame.orderId,
//     narration: frame.narration,
//     startTime: frame.startTime,
//     endTime: frame.endTime,
//     visualDescription: frame.visualDescription,
//     imageCount: frame._count.images,
//     voiceCount: frame._count.voices,
//     videoCount: frame._count.videos,
//     images: frame.images.map((image) => ({
//       ...image,
//       createdAt: image.createdAt.toISOString(),
//     })),
//     voices: frame.voices.map((voice) => ({
//       ...voice,
//       createdAt: voice.createdAt.toISOString(),
//     })),
//     videos: frame.videos.map((video) => ({
//       ...video,
//       createdAt: video.createdAt.toISOString(),
//     })),
//   }));
// }

// async function loadReels(options?: { skip?: number; take?: number }) {
//   const session = await checkUserRole("CLIENT");
//   if(!session) {
//     throw new Error("Unauthorized");
//   }
//   // const reels = (await prisma.reel.findMany({
//   //   orderBy: { createdAt: "desc" },
//   //   ...(options?.skip !== undefined && { skip: options.skip }),
//   //   ...(options?.take !== undefined && { take: options.take }),
//   //   select: {
//   //     id: true,
//   //     title: true,
//   //     audience: true,
//   //     durationSeconds: true,
//   //     status: true,
//   //     hook: true,
//   //     ending: true,
//   //     body: true,
//   //     reviewScore: true,
//   //     reviewApproved: true,
//   //     tone: true,
//   //     keywords: true,
//   //     voice: true,
//   //     createdAt: true,
//   //     updatedAt: true,
//   //     _count: {
//   //       select: {
//   //         frames: true,
//   //         reviews: true,
//   //       },
//   //     },
//   //     finalReel: {
//   //       select: {
//   //         processingStatus: true,
//   //         videoUrl: true,
//   //         thumbnailUrl: true,
//   //         duration: true,
//   //       },
//   //     },
//   //     backgroundMusic: {
//   //       select: {
//   //         musicId: true,
//   //         musicUrl: true,
//   //         style_description: true,
//   //       },
//   //     },
//   //     reviews: {
//   //       select: {
//   //         overallScore: true,
//   //         approved: true,
//   //         feedback: true,
//   //       },
//   //     },
//   //     frames: {
//   //       orderBy: { orderId: "asc" },
//   //       select: {
//   //         id: true,
//   //         orderId: true,
//   //         narration: true,
//   //         startTime: true,
//   //         endTime: true,
//   //         visualDescription: true,
//   //         _count: {
//   //           select: {
//   //             images: true,
//   //             voices: true,
//   //             videos: true,
//   //           },
//   //         },
//   //         images: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             prompt: true,
//   //             imageUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //         voices: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             language: true,
//   //             audioUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //         videos: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             prompt: true,
//   //             videoUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },
//   // })) as LoadedReel[];
//   // const reels = (await prisma.reel.findMany({
//   //   orderBy: { createdAt: "desc" },
//   //   ...(options?.skip !== undefined && { skip: options.skip }),
//   //   ...(options?.take !== undefined && { take: options.take }),
//   //   select: {
//   //     id: true,
//   //     title: true,
//   //     audience: true,
//   //     durationSeconds: true,
//   //     status: true,
//   //     hook: true,
//   //     ending: true,
//   //     body: true,
//   //     reviewScore: true,
//   //     reviewApproved: true,
//   //     tone: true,
//   //     keywords: true,
//   //     voice: true,
//   //     createdAt: true,
//   //     updatedAt: true,
//   //     _count: {
//   //       select: {
//   //         frames: true,
//   //         reviews: true,
//   //       },
//   //     },
//   //     finalReel: {
//   //       select: {
//   //         processingStatus: true,
//   //         videoUrl: true,
//   //         thumbnailUrl: true,
//   //         duration: true,
//   //       },
//   //     },
//   //     backgroundMusic: {
//   //       select: {
//   //         musicId: true,
//   //         musicUrl: true,
//   //         style_description: true,
//   //       },
//   //     },
//   //     reviews: {
//   //       select: {
//   //         overallScore: true,
//   //         approved: true,
//   //         feedback: true,
//   //       },
//   //     },
//   //     frames: {
//   //       orderBy: { orderId: "asc" },
//   //       select: {
//   //         id: true,
//   //         orderId: true,
//   //         narration: true,
//   //         startTime: true,
//   //         endTime: true,
//   //         visualDescription: true,
//   //         _count: {
//   //           select: {
//   //             images: true,
//   //             voices: true,
//   //             videos: true,
//   //           },
//   //         },
//   //         images: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             prompt: true,
//   //             imageUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //         voices: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             language: true,
//   //             audioUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //         videos: {
//   //           orderBy: { createdAt: "asc" },
//   //           select: {
//   //             id: true,
//   //             prompt: true,
//   //             videoUrl: true,
//   //             processingStatus: true,
//   //             createdAt: true,
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },
//   // })) as LoadedReel[];

//   const reels = await prisma.reel.findMany({
//     where: {clientId: session.user.id},
//     include:{
//       _count: {
//         select: {
//           frames: true,
//           reviews: true,
//         },
//       },
//       finalReel: true,
//       backgroundMusic: true,
//       frames: true
//     }
//   })
//   console.log("Reels: ",reels)

//   return reels.map<AdminReel>((reel) => ({
//     id: reel.id,
//     title: reel.title,
//     audience: reel.audience,
//     durationSeconds: reel.durationSeconds,
//     status: reel.status,
//     hook: reel.hook,
//     ending: reel.ending,
//     body: reel.body,
//     reviewScore: reel.reviewScore,
//     reviewApproved: reel.reviewApproved,
//     tone: reel.tone,
//     keywords: reel.keywords || [],
//     voice: reel.voice,
//     createdAt: reel.createdAt.toISOString(),
//     updatedAt: reel.updatedAt.toISOString(),
//     frameCount: reel._count.frames,
//     reviewCount: reel._count.reviews,
//     imageCount: reel.frames.reduce((sum, frame) => sum + frame._count.images, 0),
//     voiceCount: reel.frames.reduce((sum, frame) => sum + frame._count.voices, 0),
//     videoCount: reel.frames.reduce((sum, frame) => sum + frame._count.videos, 0),
//     finalReel: reel.finalReel,
//     backgroundMusic: reel.backgroundMusic,
//     frames: summarizeFrames(reel.frames),
//   }));
// }

// export type GetAdminReelsOptions = {
//   page?: number;
//   limit?: number;
// };

// export type PaginatedAdminReels = {
//   reels: AdminReel[];
//   totalCount: number;
//   page: number;
//   totalPages: number;
//   limit: number;
// };

// export async function getAdminReels(options?: GetAdminReelsOptions): Promise<PaginatedAdminReels> {
//   try {
//     const totalCount = await prisma.reel.count().catch(() => 0);
//     const limit = options?.limit;
//     const page = Math.max(1, options?.page || 1);

//     const skip = limit ? (page - 1) * limit : undefined;
//     const take = limit;

//     const reels = await loadReels({ skip, take });
//     const effectiveTotalCount = totalCount || reels.length;
//     const totalPages = limit ? Math.max(1, Math.ceil(effectiveTotalCount / limit)) : 1;

//     return {
//       reels,
//       totalCount: effectiveTotalCount,
//       page,
//       totalPages,
//       limit: limit || effectiveTotalCount || 15,
//     };
//   } catch {
//     return {
//       reels: [],
//       totalCount: 0,
//       page: 1,
//       totalPages: 1,
//       limit: options?.limit || 15,
//     };
//   }
// }

// export async function getAdminReelById(reelId: string) {
//   const { reels } = await getAdminReels();
//   return reels.find((reel) => reel.id === reelId) ?? null;
// }

// export async function getAdminDashboardStats() {
//   const { reels } = await getAdminReels();

//   const totalFrames = reels.reduce((sum, reel) => sum + reel.frameCount, 0);
//   const totalImages = reels.reduce((sum, reel) => sum + reel.imageCount, 0);
//   const totalVoices = reels.reduce((sum, reel) => sum + reel.voiceCount, 0);
//   const completed = reels.filter((reel) => reel.status === "COMPLETED").length;
//   const failed = reels.filter((reel) => reel.status === "FAILED").length;
//   const approvals = reels.filter((reel) => reel.reviewApproved).length;

//   return {
//     reels,
//     summary: [
//       { label: "Total reels", value: reels.length, detail: `${completed} completed` },
//       { label: "Frames", value: totalFrames, detail: "Storyboard coverage" },
//       { label: "Images", value: totalImages, detail: "Generated assets" },
//       { label: "Voices", value: totalVoices, detail: `${failed} failed jobs` },
//       { label: "Approved", value: approvals, detail: "Review-ready reels" },
//     ],
//   };
// }

// export function getAssetTranscript(reel: AdminReel) {
//   const transcript = [
//   reel.hook ? `Hook: ${reel.hook}` : "",
//   reel.body ? `Body: ${reel.body}` : "",
//   reel.ending ? `Ending: ${reel.ending}` : "",
// ]
//   .filter(Boolean)
//   .join("\n\n");

//   return transcript || "Transcript is not available yet.";
// }

// export function getStatusTone(status: ReelStatus | AssetStatus) {
//   switch (status) {
//     case "COMPLETED":
//       return "success";
//     case "RENDERING":
//     case "PROCESSING":
//     case "IMAGES_GENERATING":
//     case "VOICES_GENERATING":
//     case "VIDEOS_GENERATING":
//     case "STORYBOARD_GENERATED":
//     case "REVIEWING":
//     case "SCRIPT_GENERATED":
//       return "warning";
//     case "FAILED":
//       return "destructive";
//     default:
//       return "muted";
//   }
// }

import {
  type FinalReel,
  type FrameImage,
  type FrameVideo,
  type FrameVoice,
  type ReelBackgroundMusic,
  type ReelStatus,
} from "@prisma/client";

import prisma from "@/app/lib/prisma";
import { checkUserRole } from "@/app/lib/check-role";

type AssetStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

type ReelPreviewFrame = {
  id: string;
  orderId: number;
  narration: string;
  visualDescription: string;
  startTime: number;
  endTime: number;
  imageCount: number;
  voiceCount: number;
  videoCount: number;
  images: Array<
    Omit<
      Pick<
        FrameImage,
        | "id"
        | "prompt"
        | "imageUrl"
        | "processingStatus"
        | "createdAt"
      >,
      "createdAt"
    > & {
      createdAt: string;
    }
  >;
  voices: Array<
    Omit<
      Pick<
        FrameVoice,
        | "id"
        | "language"
        | "audioUrl"
        | "processingStatus"
        | "createdAt"
      >,
      "createdAt"
    > & {
      createdAt: string;
    }
  >;
  videos: Array<
    Omit<
      Pick<
        FrameVideo,
        | "id"
        | "prompt"
        | "videoUrl"
        | "processingStatus"
        | "createdAt"
      >,
      "createdAt"
    > & {
      createdAt: string;
    }
  >;
};

export type AdminReel = {
  id: string;
  title: string;
  audience: string;
  durationSeconds: number;
  status: ReelStatus;
  hook: string | null;
  ending: string | null;
  body: string | null;
  reviewScore: number | null;
  reviewApproved: boolean;
  tone: string | null;
  keywords: string[];
  voice: string | null;
  createdAt: string;
  updatedAt: string;
  frameCount: number;
  imageCount: number;
  voiceCount: number;
  videoCount: number;
  finalReel:
    | Pick<
        FinalReel,
        "processingStatus" | "videoUrl" | "thumbnailUrl" | "duration"
      >
    | null;
  backgroundMusic:
    | Pick<
        ReelBackgroundMusic,
        "musicId" | "musicUrl" | "style_description"
      >
    | null;
  frames: ReelPreviewFrame[];
};

function summarizeFrames(
  frames: Array<{
    id: string;
    orderId: number;
    narration: string;
    visualDescription: string;
    startTime: number;
    endTime: number;
    _count: {
      images: number;
      voices: number;
      videos: number;
    };
    images: Pick<
      FrameImage,
      "id" | "prompt" | "imageUrl" | "processingStatus" | "createdAt"
    >[];
    voices: Pick<
      FrameVoice,
      "id" | "language" | "audioUrl" | "processingStatus" | "createdAt"
    >[];
    videos: Pick<
      FrameVideo,
      "id" | "prompt" | "videoUrl" | "processingStatus" | "createdAt"
    >[];
  }>
): ReelPreviewFrame[] {
  return frames.map((frame) => ({
    id: frame.id,
    orderId: frame.orderId,
    narration: frame.narration,
    startTime: frame.startTime,
    endTime: frame.endTime,
    visualDescription: frame.visualDescription,

    imageCount: frame._count.images,
    voiceCount: frame._count.voices,
    videoCount: frame._count.videos,

    images: frame.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),

    voices: frame.voices.map((voice) => ({
      ...voice,
      createdAt: voice.createdAt.toISOString(),
    })),

    videos: frame.videos.map((video) => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
    })),
  }));
}

async function loadReels(options?: {
  skip?: number;
  take?: number;
}): Promise<AdminReel[]> {
  const session = await checkUserRole("CLIENT");

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const reels = await prisma.reel.findMany({
    where: {
      clientId: session.user.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    ...(options?.skip !== undefined && {
      skip: options.skip,
    }),

    ...(options?.take !== undefined && {
      take: options.take,
    }),

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

  return reels.map<AdminReel>((reel) => ({
    id: reel.id,
    title: reel.title,
    audience: reel.audience,
    durationSeconds: reel.durationSeconds,
    status: reel.status,

    hook: reel.hook,
    ending: reel.ending,
    body: reel.body,

    reviewScore: reel.reviewScore,
    reviewApproved: reel.reviewApproved,

    tone: reel.tone,
    keywords: reel.keywords ?? [],
    voice: reel.voice,

    createdAt: reel.createdAt.toISOString(),
    updatedAt: reel.updatedAt.toISOString(),

    frameCount: reel._count.frames,

    imageCount: reel.frames.reduce(
      (sum, frame) => sum + frame._count.images,
      0
    ),

    voiceCount: reel.frames.reduce(
      (sum, frame) => sum + frame._count.voices,
      0
    ),

    videoCount: reel.frames.reduce(
      (sum, frame) => sum + frame._count.videos,
      0
    ),

    finalReel: reel.finalReel,
    backgroundMusic: reel.backgroundMusic,

    frames: summarizeFrames(reel.frames),
  }));
}

export type GetAdminReelsOptions = {
  page?: number;
  limit?: number;
};

export type PaginatedAdminReels = {
  reels: AdminReel[];
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
};

export async function getAdminReels(
  options?: GetAdminReelsOptions
): Promise<PaginatedAdminReels> {
  try {
    const session = await checkUserRole("CLIENT");

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const page = Math.max(1, options?.page ?? 1);
    const limit = options?.limit;

    const where = {
      clientId: session.user.id,
    };

    const totalCount = await prisma.reel.count({
      where,
    });

    const skip =
      limit !== undefined ? (page - 1) * limit : undefined;

    const take = limit;

    const reels = await loadReels({
      skip,
      take,
    });

    const totalPages =
      limit !== undefined
        ? Math.max(1, Math.ceil(totalCount / limit))
        : 1;

    return {
      reels,
      totalCount,
      page,
      totalPages,
      limit: limit ?? totalCount,
    };
  } catch (error) {
    console.error("Failed to load admin reels:", error);

    return {
      reels: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
      limit: options?.limit ?? 15,
    };
  }
}

export async function getAdminReelById(
  reelId: string
): Promise<AdminReel | null> {
  const { reels } = await getAdminReels();

  return reels.find((reel) => reel.id === reelId) ?? null;
}

export async function getAdminDashboardStats() {
  const { reels } = await getAdminReels();

  const totalFrames = reels.reduce(
    (sum, reel) => sum + reel.frameCount,
    0
  );

  const totalImages = reels.reduce(
    (sum, reel) => sum + reel.imageCount,
    0
  );

  const totalVoices = reels.reduce(
    (sum, reel) => sum + reel.voiceCount,
    0
  );

  const completed = reels.filter(
    (reel) => reel.status === "COMPLETED"
  ).length;

  const failed = reels.filter(
    (reel) => reel.status === "FAILED"
  ).length;

  const approvals = reels.filter(
    (reel) => reel.reviewApproved
  ).length;

  return {
    reels,

    summary: [
      {
        label: "Total reels",
        value: reels.length,
        detail: `${completed} completed`,
      },
      {
        label: "Frames",
        value: totalFrames,
        detail: "Storyboard coverage",
      },
      {
        label: "Images",
        value: totalImages,
        detail: "Generated assets",
      },
      {
        label: "Voices",
        value: totalVoices,
        detail: `${failed} failed jobs`,
      },
      {
        label: "Approved",
        value: approvals,
        detail: "Review-ready reels",
      },
    ],
  };
}

export function getAssetTranscript(reel: AdminReel): string {
  const transcript = [
    reel.hook ? `Hook: ${reel.hook}` : "",
    reel.body ? `Body: ${reel.body}` : "",
    reel.ending ? `Ending: ${reel.ending}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return transcript || "Transcript is not available yet.";
}

export function getStatusTone(
  status: ReelStatus | AssetStatus
): "success" | "warning" | "destructive" | "muted" {
  switch (status) {
    case "COMPLETED":
      return "success";

    case "RENDERING":
    case "PROCESSING":
    case "IMAGES_GENERATING":
    case "VOICES_GENERATING":
    case "VIDEOS_GENERATING":
    case "STORYBOARD_GENERATED":
    case "REVIEWING":
    case "SCRIPT_GENERATED":
      return "warning";

    case "FAILED":
      return "destructive";

    default:
      return "muted";
  }
}
