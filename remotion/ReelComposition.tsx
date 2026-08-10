import { AbsoluteFill, Sequence, useVideoConfig, Audio } from "remotion";
import { FrameScene } from "./FrameScene";

export interface ReelFrameInput {
  id: string;
  orderId: number;

  imageUrl: string;
  audioUrl: string | null;

  narration: string;

  startTime: number;
  endTime: number;

  transition:
    | "Cut"
    | "Fade"
    | "Dissolve"
    | "Zoom"
    | "Whip Pan";

  cameraMovement:
    | "Static"
    | "Push In"
    | "Pull Out"
    | "Pan Left"
    | "Pan Right"
    | "Tilt Up"
    | "Tilt Down"
    | "Dolly"
    | "Zoom";
}

export interface ReelCompositionProps extends Record<string, unknown> {
  frames: ReelFrameInput[];
  bgMusicUrl?: string | null;
}

const TRANSITION_FRAMES = 8;

export function ReelComposition({
  frames,
  bgMusicUrl,
}: ReelCompositionProps) {
  const { fps } = useVideoConfig();

  if (!frames.length) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
      }}
    >
      {bgMusicUrl && (
        <Audio src={bgMusicUrl} volume={0.15} loop />
      )}
      {frames.map((frame) => {
        const startFrame = Math.round(frame.startTime * fps);

        const endFrame = Math.round(frame.endTime * fps);

        const HOLD_FRAMES = Math.round(0.15 * fps);

        const durationInFrames = Math.max(
          1,
          endFrame - startFrame + HOLD_FRAMES
        );

        /**
         * Fade/Dissolve/Zoom/WhipPan
         * start a few frames earlier.
         *
         * Cut starts exactly on time.
         */
        const overlap =
          frame.transition === "Cut"
            ? 1
            : TRANSITION_FRAMES;

        return (
          <Sequence
            key={frame.id}
            from={Math.max(0, startFrame - overlap)}
            durationInFrames={durationInFrames + overlap}
            layout="none"
          >
            <FrameScene
              imageUrl={frame.imageUrl}
              audioUrl={frame.audioUrl}
              narration={frame.narration}
              transition={frame.transition}
              cameraMovement={frame.cameraMovement}
              transitionFrames={overlap}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}