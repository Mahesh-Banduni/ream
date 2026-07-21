import { Composition, registerRoot } from "remotion";
import { ReelComposition, type ReelCompositionProps } from "./ReelComposition";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920; // 9:16 portrait

/** Default props used in Remotion Studio preview */
const defaultProps: ReelCompositionProps = {
  frames: [
    {
      id: "preview-frame-1",
      orderId: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1682686580950-960d1d513532?w=1080",
      audioUrl: null,
      narration: "Preview narration for frame 1",
      startTime: 0,
      endTime: 5,
      transition: "crossfade",
    },
    {
      id: "preview-frame-2",
      orderId: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=1080",
      audioUrl: null,
      narration: "Preview narration for frame 2",
      startTime: 5,
      endTime: 10,
      transition: "crossfade",
    },
  ],
};

export function RemotionRoot() {
  return (
    <Composition
      id="ReelComposition"
      component={ReelComposition}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={FPS * 10}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => {
        const totalSec = props.frames.reduce(
          (sum: number, f: { endTime: number }) => Math.max(sum, f.endTime),
          0
        );
        return {
          durationInFrames: Math.max(1, Math.round(totalSec * FPS)),
        };
      }}
    />
  );
}

registerRoot(RemotionRoot);
