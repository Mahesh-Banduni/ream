import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { FrameScene } from "./FrameScene";

export interface ReelFrameInput {
  id: string;
  orderId: number;
  imageUrl: string;
  audioUrl: string | null;
  narration: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  transition: string;
}

export interface ReelCompositionProps extends Record<string, unknown> {
  frames: ReelFrameInput[];
}

/** Cross-fade overlap in frames (at 30fps, 9 frames = 0.3s) */
const TRANSITION_FRAMES = 9;

export function ReelComposition({ frames }: ReelCompositionProps) {
  const { fps } = useVideoConfig();

  if (!frames || frames.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }} />
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {frames.map((frame, index) => {
        const frameDurationSec = frame.endTime - frame.startTime;
        const durationInFrames = Math.max(
          1,
          Math.round(frameDurationSec * fps)
        );

        // Start frame: convert startTime to frames.
        // Offset each sequence slightly back by (index * TRANSITION_FRAMES)
        // so they overlap and cross-fade.
        const fromFrame = Math.round(frame.startTime * fps) - index * TRANSITION_FRAMES;

        return (
          <Sequence
            key={frame.id}
            from={Math.max(0, fromFrame)}
            durationInFrames={durationInFrames + TRANSITION_FRAMES}
            layout="none"
          >
            <FrameScene
              imageUrl={frame.imageUrl}
              audioUrl={frame.audioUrl}
              narration={frame.narration}
              durationInFrames={durationInFrames + TRANSITION_FRAMES}
              transitionFrames={TRANSITION_FRAMES}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
