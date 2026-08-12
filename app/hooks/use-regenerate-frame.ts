"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type RegenerateMode =
  | "everything"
  | "voice_only"
  | "image_only";

export type Status = "idle" | "loading" | "success" | "error";

interface UseRegenerateFrameProps {
  reelId: string;
  frameId: string;
}

export function useRegenerateFrame({ reelId, frameId }: UseRegenerateFrameProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [activeMode, setActiveMode] = useState<RegenerateMode | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-reset success/error after 3s
  useEffect(() => {
    if (status === "success" || status === "error") {
      const t = setTimeout(() => {
        setStatus("idle");
        setErrorMsg(null);
        setActiveMode(null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  async function handleRegenerate(mode: RegenerateMode) {
    setStatus("loading");
    setActiveMode(mode);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/client/reels/${reelId}/frames/${frameId}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Regeneration failed.");
      }

      setStatus("success");
      router.refresh();
      return true;
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
      return false;
    }
  }

  return {
    status,
    activeMode,
    errorMsg,
    handleRegenerate,
  };
}
