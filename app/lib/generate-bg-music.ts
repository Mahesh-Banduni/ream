const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

const API_DELAY = 500;

function jsonHeaders(cookie?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

function authHeaders(cookie?: string) {
  const headers: Record<string, string> = {};
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

interface WorkflowResult<T> {
  success: boolean;
  attempts: number;
  result?: T;
  error?: unknown;
}

interface WorkflowOptions<T> {
  maxRetries?: number;
  delayMs?: number;
  execute: () => Promise<T>;
}


const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function executeWithRetry<T>({
  execute,
  maxRetries = 3,
  delayMs = API_DELAY,
}: WorkflowOptions<T>): Promise<WorkflowResult<T>> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await execute();

      return {
        success: true,
        attempts: attempt,
        result,
      };
    } catch (err) {
      lastError = err;

      console.warn(
        `Attempt ${attempt}/${maxRetries} failed.`,
        err
      );

      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }

  return {
    success: false,
    attempts: maxRetries,
    error: lastError,
  };
}

async function generateBackgroundMusic(reelId: string, cookie?: string) {
  const res = await fetch(`${baseUrl}/api/client/assets/bg-music`, {
    method: "POST",
    headers: jsonHeaders(cookie),
    body: JSON.stringify({
      reelId,
    }),
  });

  if (!res.ok) {
    throw new Error("Music generation search failed");
  }

  const data = await res.json();
  const trackUrl =
    data.music?.music?.url ||
    data.music?.music?.preview ||
    data.music?.url;

  if (!trackUrl) {
    console.warn("No background music track URL returned from search, skipping music upload");
    return {
      musicUrl: null,
      style_description: data.style_description || "Background music",
    };
  }

  // Fetch audio file from Pixabay
  const audioRes = await fetch(trackUrl);
  if (!audioRes.ok) {
    throw new Error("Failed to fetch audio stream from Pixabay");
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const file = new File([buffer], `${reelId}.mp3`, {
    type: "audio/mpeg",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/client/upload/bg-sound`, {
    method: "POST",
    headers: authHeaders(cookie),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to upload background music (${response.status}): ${message}`
    );
  }

  const uploadData = await response.json();

  return {
    musicUrl: uploadData.url,
    style_description: data.style_description || "Background music",
  };
}

export async function generateReelBgMusic(reelId: string, cookie?: string){
    const musicResult = await executeWithRetry({
      execute: () => generateBackgroundMusic(reelId, cookie),
    });
    return musicResult;
}
