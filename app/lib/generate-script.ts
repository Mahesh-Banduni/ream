interface ReelScript {
  hook: string;
  body: string;
  ending: string;
}

interface GeneratedScriptResult {
  script: ReelScript;
  framePlan: FramePlan;
  estimatedDuration: number;
  reviewScore: number;
  reviewApproved: boolean;
  reviewFeedback: string;
  attempts: number;
}

interface ReviewResult {
  score: number;
  approved: boolean;
  feedback: string;
}

interface WorkflowResult<T> {
  success: boolean;
  attempts: number;
  result?: T;
  review?: ReviewResult;
  error?: unknown;
}

interface Frame {
  orderId: number;
  frameNumber: number;
  startTime: number;
  endTime: number;
  narration: string;
  visualDescription: string;
  imagePrompt: string;
  cameraShot: string;
  cameraMovement: string;
  transition: string;
}

interface FramePlan {
  totalFrames: number;
  frames: Frame[];
}

interface WorkflowOptions<T> {
  maxRetries?: number;
  minScore?: number;

  generate: (feedback?: string) => Promise<T>;
  review: (result: T) => Promise<ReviewResult>;
}

const API_DELAY_MS = 500;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithReview<T>({
  generate,
  review,
  maxRetries = 1,
  minScore = 1.5,
}: WorkflowOptions<T>): Promise<WorkflowResult<T>> {
  let lastResult: T | undefined;
  let lastReview: ReviewResult | undefined;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Small delay before repeated generate calls
      if (attempt > 1) {
        await sleep(API_DELAY_MS);
      }

      const result = await generate(lastReview?.feedback);

      // Small delay before review API
      await sleep(API_DELAY_MS);

      const reviewResult = await review(result);

      lastResult = result;
      lastReview = reviewResult;

      if (
        reviewResult.approved &&
        reviewResult.score >= minScore
      ) {
        return {
          success: true,
          attempts: attempt,
          result,
          review: reviewResult,
        };
      }

      // Delay before next retry cycle
      if (attempt < maxRetries) {
        await sleep(API_DELAY_MS);
      }
    } catch (err) {
      lastError = err;

      if (attempt < maxRetries) {
        await sleep(API_DELAY_MS);
      }
    }
  }

  return {
    success: false,
    attempts: maxRetries,
    result: lastResult,
    review: lastReview,
    error: lastError,
  };
}

export async function generateScript(reelId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

  const result = await generateWithReview({
    maxRetries: 1,
    minScore: 1.5,

    generate: async (feedback?: string) => {
      const res = await fetch(`${baseUrl}/api/script/primary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reelId,
          feedback,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate script");
      }

      const data = await res.json()

      return data;
    },

    review: async (script) => {
      const res = await fetch(`${baseUrl}/api/script/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reelId,
          script,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to review script");
      }

      const review = await res.json();

      return {
        score: review.overallScore,
        approved: review.approved,
        feedback: review.feedback,
      };
    },
  });

  if (!result.success) {
    console.warn(
      `Script review failed after ${result.attempts} attempts.`,
      result.review
    );

    throw new Error(
      result.review?.feedback ?? "Unable to generate a satisfactory script."
    );
  }

  return {
    script: {
      hook: result.result!.hook,
      body: result.result!.body,
      ending: result.result!.ending,
    },
    framePlan: result.result!.framePlan,
    estimatedDuration: result.result!.estimatedDuration,
    reviewScore: result.review!.score,
    reviewApproved: result.review!.approved,
    reviewFeedback: result.review!.feedback,
    attempts: result.attempts,
  } satisfies GeneratedScriptResult;
}

