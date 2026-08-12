// import {
//   AbsoluteFill,
//   Audio,
//   Img,
//   interpolate,
//   useCurrentFrame,
//   useVideoConfig,
// } from "remotion";

// export interface FrameSceneProps {
//   imageUrl: string;
//   audioUrl: string | null;
//   narration: string;
//   durationInFrames: number;
//   /** Transition overlap in frames from both ends */
//   transitionFrames: number;
// }

// export function FrameScene({
//   imageUrl,
//   audioUrl,
//   transitionFrames,
// }: FrameSceneProps) {
//   const frame = useCurrentFrame();
//   const { durationInFrames } = useVideoConfig();

//   // ── Fade-in opacity (cross-fade from previous scene) ──
//   const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
//     extrapolateLeft: "clamp",
//     extrapolateRight: "clamp",
//   });

//   // ── Fade-out opacity (cross-fade into next scene) ──
//   const fadeOut = interpolate(
//     frame,
//     [durationInFrames - transitionFrames, durationInFrames],
//     [1, 0],
//     { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
//   );

//   const opacity = Math.min(fadeIn, fadeOut);

//   // ── Subtle Ken Burns zoom: 100% → 108% over the clip duration ──
//   const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
//     extrapolateLeft: "clamp",
//     extrapolateRight: "clamp",
//   });

//   return (
//     <AbsoluteFill style={{ opacity, backgroundColor: "#000" }}>
//       {/* Image layer */}
//       <AbsoluteFill>
//         <Img
//           src={imageUrl}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//             transform: `scale(${scale})`,
//             transformOrigin: "center center",
//           }}
//         />
//       </AbsoluteFill>

//       {/* Dark gradient overlay for readability */}
//       <AbsoluteFill
//         style={{
//           background:
//             "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
//         }}
//       />

//       {/* Audio track (voice-over) */}
//       {audioUrl && (
//         <Audio src={audioUrl} startFrom={0} />
//       )}
//     </AbsoluteFill>
//   );
// }

// import {
//   AbsoluteFill,
//   Audio,
//   Img,
//   spring,
//   interpolate,
//   useCurrentFrame,
//   useVideoConfig,
// } from "remotion";

// export interface FrameSceneProps {
//   imageUrl: string;
//   audioUrl: string | null;
//   narration: string;
//   durationInFrames: number;
//   /** Transition overlap in frames from both ends */
//   transitionFrames: number;
// }

// export function FrameScene({
//   imageUrl,
//   audioUrl,
//   transitionFrames,
// }: FrameSceneProps) {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames } = useVideoConfig();

//   const progress = spring({
//     fps,
//     frame,
//     config: {
//       damping: 18,
//       stiffness: 40,
//     },
//   });

//   // Fade
//   const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
//     extrapolateRight: "clamp",
//   });

//   const fadeOut = interpolate(
//     frame,
//     [durationInFrames - transitionFrames, durationInFrames],
//     [1, 0],
//     {
//       extrapolateLeft: "clamp",
//     }
//   );

//   const opacity = Math.min(fadeIn, fadeOut);

//   // Camera movement
//   const scale = interpolate(progress, [0, 1], [1.05, 1.15]);

//   const translateX = interpolate(progress, [0, 1], [-25, 25]);

//   const translateY = interpolate(progress, [0, 1], [20, -20]);

//   const rotate = interpolate(progress, [0, 1], [-0.5, 0.5]);

//   return (
//     <AbsoluteFill style={{ opacity, backgroundColor: "#000" }}>
//       <Img
//         src={imageUrl}
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//           transform: `
//             translate(${translateX}px, ${translateY}px)
//             scale(${scale})
//             rotate(${rotate}deg)
//           `,
//         }}
//       />

//       <AbsoluteFill
//         style={{
//           background:
//             "linear-gradient(to top, rgba(0,0,0,.5), transparent 45%, rgba(0,0,0,.15))",
//         }}
//       />

//       {audioUrl && <Audio src={audioUrl} />}
//     </AbsoluteFill>
//   );
// }

// import {
//   AbsoluteFill,
//   Audio,
//   Img,
//   spring,
//   interpolate,
//   useCurrentFrame,
//   useVideoConfig,
// } from "remotion";

// export interface FrameSceneProps {
//   imageUrl: string;
//   audioUrl: string | null;
//   narration: string;
//   durationInFrames: number;
//   /** Transition overlap in frames from both ends */
//   transitionFrames: number;
// }

// export function FrameScene({
//   imageUrl,
//   audioUrl,
//   narration, // Added narration back to the props
//   transitionFrames,
// }: FrameSceneProps) {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames } = useVideoConfig();

//   const progress = spring({
//     fps,
//     frame,
//     config: {
//       damping: 18,
//       stiffness: 40,
//     },
//   });

//   // Fade
//   const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
//     extrapolateRight: "clamp",
//   });

//   const fadeOut = interpolate(
//     frame,
//     [durationInFrames - transitionFrames, durationInFrames],
//     [1, 0],
//     {
//       extrapolateLeft: "clamp",
//     }
//   );

//   const opacity = Math.min(fadeIn, fadeOut);

//   // Camera movement
//   const scale = interpolate(progress, [0, 1], [1.05, 1.15]);
//   const translateX = interpolate(progress, [0, 1], [-25, 25]);
//   const translateY = interpolate(progress, [0, 1], [20, -20]);
//   const rotate = interpolate(progress, [0, 1], [-0.5, 0.5]);

//   return (
//     <AbsoluteFill style={{ opacity, backgroundColor: "#000" }}>
//       {/* Background Image with Camera Movement */}
//       <Img
//         src={imageUrl}
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//           transform: `
//             translate(${translateX}px, ${translateY}px)
//             scale(${scale})
//             rotate(${rotate}deg)
//           `,
//         }}
//       />

//       {/* Dark Gradient Overlay (Slightly darkened at the bottom for text readability) */}
//       <AbsoluteFill
//         style={{
//           background:
//             "linear-gradient(to top, rgba(0,0,0,.8), transparent 50%, rgba(0,0,0,.15))",
//         }}
//       />

//       {/* Narration Text Display */}
//       {narration && (
//         <AbsoluteFill
//           style={{
//             justifyContent: "flex-end",
//             alignItems: "center",
//             padding: "60px 40px",
//             pointerEvents: "none",
//           }}
//         >
//           <p
//             style={{
//               color: "white",
//               fontSize: 56,
//               fontFamily: "sans-serif",
//               fontWeight: "bold",
//               textAlign: "center",
//               lineHeight: 1.3,
//               margin: 0,
//               textShadow: "2px 4px 10px rgba(0,0,0,0.8)",
//               maxWidth: "90%",
//             }}
//           >
//             {narration}
//           </p>
//         </AbsoluteFill>
//       )}

//       {/* Audio */}
//       {audioUrl && <Audio src={audioUrl} />}
//     </AbsoluteFill>
//   );
// }


// import {
//   AbsoluteFill,
//   Audio,
//   Img,
//   spring,
//   interpolate,
//   useCurrentFrame,
//   useVideoConfig,
// } from "remotion";

// export interface FrameSceneProps {
//   imageUrl: string;
//   audioUrl: string | null;
//   narration: string;
//   durationInFrames: number;
//   /** Transition overlap in frames from both ends */
//   transitionFrames: number;
// }

// export function FrameScene({
//   imageUrl,
//   audioUrl,
//   transitionFrames,
//   narration, // <--- 1. Add narration to destructured props
// }: FrameSceneProps) {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames } = useVideoConfig();

//   const progress = spring({
//     fps,
//     frame,
//     config: {
//       damping: 18,
//       stiffness: 40,
//     },
//   });

//   // Scene Fade
//   const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
//     extrapolateRight: "clamp",
//   });

//   const fadeOut = interpolate(
//     frame,
//     [durationInFrames - transitionFrames, durationInFrames],
//     [1, 0],
//     {
//       extrapolateLeft: "clamp",
//     }
//   );

//   const opacity = Math.min(fadeIn, fadeOut);

//   // Camera movement for the image
//   const scale = interpolate(progress, [0, 1], [1.05, 1.15]);
//   const translateX = interpolate(progress, [0, 1], [-25, 25]);
//   const translateY = interpolate(progress, [0, 1], [20, -20]);
//   const rotate = interpolate(progress, [0, 1], [-0.5, 0.5]);

//   // <--- 2. Text Animation: slides up slightly as the scene fades in
//   const textTranslateY = interpolate(
//     frame,
//     [0, transitionFrames],
//     [40, 0], // Starts 40px down and slides up to 0px
//     { extrapolateRight: "clamp" }
//   );

//   return (
//     <AbsoluteFill style={{ opacity, backgroundColor: "#000" }}>
//       <Img
//         src={imageUrl}
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//           transform: `
//             translate(${translateX}px, ${translateY}px)
//             scale(${scale})
//             rotate(${rotate}deg)
//           `,
//         }}
//       />

//       {/* <--- 3. Darkened the bottom gradient slightly for better text readability */}
//       <AbsoluteFill
//         style={{
//           background:
//             "linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%, rgba(0,0,0,0.15))",
//         }}
//       />

//       {/* <--- 4. Narration Text Component */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: 150, // Positioned in the lower third
//           left: 60,
//           right: 60,
//           textAlign: "center",
//           color: "white",
//           fontSize: 56,
//           fontWeight: 800,
//           fontFamily: "system-ui, -apple-system, sans-serif",
//           textShadow: "0px 4px 12px rgba(0,0,0,0.8)", // Drop shadow for contrast
//           lineHeight: 1.2,
//           transform: `translateY(${textTranslateY}px)`,
//         }}
//       >
//         {narration}
//       </div>

//       {audioUrl && <Audio src={audioUrl} />}
//     </AbsoluteFill>
//   );
// }

import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface FrameSceneProps {
  imageUrl: string;
  audioUrl: string | null;
  narration: string;

  transitionFrames: number;

  cameraMovement?:
    | "Static"
    | "Push In"
    | "Pull Out"
    | "Pan Left"
    | "Pan Right"
    | "Tilt Up"
    | "Tilt Down"
    | "Dolly"
    | "Zoom";

  transition?:
    | "Cut"
    | "Fade"
    | "Dissolve"
    | "Zoom"
    | "Whip Pan";
}

export function FrameScene({
  imageUrl,
  audioUrl,
  narration,
  transitionFrames,
  cameraMovement = "Push In",
  transition = "Cut",
}: FrameSceneProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 22,
      stiffness: 55,
    },
  });

  /* ----------------------------------------------------- */
  /* Transition opacity                                    */
  /* ----------------------------------------------------- */

const fadeIn =
  transitionFrames > 0
    ? interpolate(frame, [0, transitionFrames], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
    }
  );

  const opacity =
    transition === "Cut" ? 1 : Math.min(fadeIn, fadeOut);

  /* ----------------------------------------------------- */
  /* Camera Movement                                       */
  /* ----------------------------------------------------- */

  let scale = 1.08;
  let translateX = 0;
  let translateY = 0;

  switch (cameraMovement) {
    case "Push In":
      scale = interpolate(progress, [0, 1], [1.05, 1.15]);
      break;

    case "Pull Out":
      scale = interpolate(progress, [0, 1], [1.15, 1.05]);
      break;

    case "Zoom":
      scale = interpolate(progress, [0, 1], [1.0, 1.2]);
      break;

    case "Pan Left":
      translateX = interpolate(progress, [0, 1], [40, -40]);
      break;

    case "Pan Right":
      translateX = interpolate(progress, [0, 1], [-40, 40]);
      break;

    case "Tilt Up":
      translateY = interpolate(progress, [0, 1], [30, -30]);
      break;

    case "Tilt Down":
      translateY = interpolate(progress, [0, 1], [-30, 30]);
      break;

    case "Dolly":
      scale = interpolate(progress, [0, 1], [1.05, 1.12]);
      translateY = interpolate(progress, [0, 1], [20, -20]);
      break;

    case "Static":
    default:
      break;
  }

  /* ----------------------------------------------------- */
  /* Caption animation                                     */
  /* ----------------------------------------------------- */

const textOpacity =
  transitionFrames > 0
    ? interpolate(frame, [0, transitionFrames], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

const textTranslateY =
  transitionFrames > 0
    ? interpolate(frame, [0, transitionFrames], [40, 0], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity,
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `
            translate(${translateX}px, ${translateY}px)
            scale(${scale})
          `,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.15) 45%, rgba(0,0,0,.05))",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 70,
          right: 70,

          color: "#fff",

          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.2,

          textAlign: "center",

          fontFamily:
            "Inter, system-ui, -apple-system, sans-serif",

          letterSpacing: "-0.02em",

          textShadow:
            "0 4px 18px rgba(0,0,0,.85)",

          opacity: textOpacity,

          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        {narration}
      </div>

      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
}