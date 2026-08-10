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

export default async function generateFrameImage(frame: object, cookie?: string) {
  const res = await fetch(`${baseUrl}/api/client/assets/image`, {
    method: "POST",
    headers: buildAuthHeaders(cookie),
    body: JSON.stringify({ frame }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate frame image");
  }

  return res.json();
}