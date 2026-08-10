"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type BgMusicStatus = "idle" | "loading" | "success" | "error";

export function useRegenerateBgMusic(reelId: string) {
  const router = useRouter();
  const [status, setStatus] = useState<BgMusicStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-reset success/error after 3 s
  useEffect(() => {
    if (status === "success" || status === "error") {
      const t = setTimeout(() => {
        setStatus("idle");
        setErrorMsg(null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  async function regenerate() {
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/client/reel-bg-music", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Regeneration failed.");
      }

      setStatus("success");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  return { status, errorMsg, regenerate };
}
