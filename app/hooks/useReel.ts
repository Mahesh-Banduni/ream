interface ReelInput {
  title: string;
  audience: string;
  durationSeconds: number;
}

export function useReel() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

  const createReel = async (data: ReelInput) => {
    try {
      const response = await fetch(`${baseUrl}/api/reels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          audience: data.audience,
          durationSeconds: data.durationSeconds,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "Something went wrong.");
      }

      return await response.json();
    } catch (error) {
      console.error("createReel error:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to create reel.");
    }
  };

  const generateReelScript = async (reelId: string) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/reels/${reelId}/generate-script`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate script");
      }

      const scriptResponse = await response.json();

      const res = await fetch(`${baseUrl}/api/reels/${reelId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scriptResponse),
      });

      if (!res.ok) {
        throw new Error("Failed to update reel with generated script");
      }

      const response2 = await fetch(`${baseUrl}/api/reelframe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames: scriptResponse.framePlan.frames,
          reelId,
        }),
      });

      if (!response2.ok) {
        throw new Error("Failed to create reel frames");
      }

      return await res.json();
    } catch (error) {
      console.error("generateReelScript error:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to generate reel script.");
    }
  };

  const generateFrameAssets = async (reelId: string) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/reels/${reelId}/generate-assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate assets");
      }

      const assetsData = await res.json();

      const response1 = await fetch(`${baseUrl}/api/framevoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voices: assetsData.voices,
          reelId,
        }),
      });

      if (!response1.ok) {
        throw new Error("Failed to create frame voices");
      }

      const response2 = await fetch(`${baseUrl}/api/frameimage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: assetsData.images,
          reelId,
        }),
      });

      if (!response2.ok) {
        throw new Error("Failed to create frame images");
      }

      return await response1.json();
    } catch (error) {
      console.error("generateFrameAssets error:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to generate frame assets.");
    }
  };

  return {
    createReel,
    generateReelScript,
    generateFrameAssets,
  };
}