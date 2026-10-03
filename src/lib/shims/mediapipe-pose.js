// @tensorflow-models/pose-detection statically imports { Pose } from
// @mediapipe/pose, but that package is a UMD bundle with no ES exports, so
// Turbopack fails the build. FexoMirror only uses the MoveNet (tfjs)
// detector, which never touches MediaPipe — next.config.ts aliases
// @mediapipe/pose to this stub so the import resolves.
export class Pose {
  constructor() {
    throw new Error('@mediapipe/pose is not bundled; use the MoveNet detector instead.');
  }
}
