import { parseBuffer } from "music-metadata";
const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

function buildAuthHeaders(cookie?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

function buildFormDataHeaders(cookie?: string) {
  const headers: Record<string, string> = {};
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

export default async function generateFrameAudio(
  frame: {
    id: string;
    [key: string]: unknown;
  },
  speaker: string = "shubh",
  cookie?: string
) {
  const res = await fetch(`${baseUrl}/api/client/assets/voice`, {
    method: "POST",
    headers: buildAuthHeaders(cookie),
    body: JSON.stringify({ frame, speaker }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate frame audio");
  }

  const data = await res.json();
  const buffer = Buffer.from(data.audio);

  const metadata = await parseBuffer(buffer, {
    mimeType: "audio/mpeg",
    size: buffer.length,
  });

  const duration = metadata.format.duration ?? 0;

  const file = new File([buffer], `${frame.id}.mp3`, {
    type: "audio/mpeg",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/client/upload/voice`, {
    method: "POST",
    headers: buildFormDataHeaders(cookie),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to upload voice (${response.status}): ${message}`
    );
  }

  const uploadResult = await response.json();
  return {
    ...uploadResult,
    duration,
  };
}
