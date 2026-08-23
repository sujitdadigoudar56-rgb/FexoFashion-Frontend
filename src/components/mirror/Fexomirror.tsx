'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface FexoMirrorProps {
  open: boolean;
  onClose: () => void;
  garmentImageUrl: string;
  garmentName: string;
}

export default function FexoMirror({ open, onClose, garmentImageUrl, garmentName }: FexoMirrorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const garmentImgRef = useRef<HTMLImageElement | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setStatus('loading');
    setErrorMsg('');

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        await tf.setBackend('webgl');
        await tf.ready();
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });
        if (cancelled) return;
        detectorRef.current = detector;

        const garmentImg = new Image();
        garmentImg.crossOrigin = 'anonymous';
        garmentImg.src = garmentImageUrl;
        garmentImgRef.current = garmentImg;

        setStatus('ready');
        loop();
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera permission and try again.'
            : 'Could not start Fexo Mirror. Make sure your camera is available.'
        );
      }
    };

    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;
      if (!video || !canvas || !detector || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the feed horizontally so it behaves like a real mirror.
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      detector.estimatePoses(video).then((poses) => {
        const kp = poses[0]?.keypoints;
        if (!kp) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        const byName = (name: string) => kp.find((k) => k.name === name);
        const lShoulder = byName('left_shoulder');
        const rShoulder = byName('right_shoulder');
        const lHip = byName('left_hip');
        const rHip = byName('right_hip');

        const minScore = 0.4;
        if (
          lShoulder && rShoulder && lHip && rHip &&
          (lShoulder.score ?? 0) > minScore && (rShoulder.score ?? 0) > minScore &&
          (lHip.score ?? 0) > minScore && (rHip.score ?? 0) > minScore &&
          garmentImgRef.current?.complete
        ) {
          // Mirror the x-coordinates to match the flipped canvas draw above.
          const mirrorX = (x: number) => canvas.width - x;
          const lsx = mirrorX(lShoulder.x), lsy = lShoulder.y;
          const rsx = mirrorX(rShoulder.x), rsy = rShoulder.y;
          const lhy = lHip.y, rhy = rHip.y;

          const shoulderWidth = Math.hypot(rsx - lsx, rsy - lsy);
          const centerX = (lsx + rsx) / 2;
          const centerY = (lsy + rsy) / 2;
          const torsoHeight = ((lhy + rhy) / 2) - centerY;
          const angle = Math.atan2(rsy - lsy, rsx - lsx);

          const garmentWidth = shoulderWidth * 2.1;
          const garmentHeight = torsoHeight * 2.5;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          ctx.globalAlpha = 0.92;
          ctx.drawImage(
            garmentImgRef.current,
            -garmentWidth / 2,
            -garmentHeight * 0.15,
            garmentWidth,
            garmentHeight
          );
          ctx.restore();
        }
        rafRef.current = requestAnimationFrame(loop);
      });
    };

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      detectorRef.current?.dispose();
      detectorRef.current = null;
      setStatus('idle');
    };
  }, [open, garmentImageUrl]);

  if (!open) return null;

  return (
    <div className="fx-mirror-overlay">
      <button type="button" className="fx-mirror-close" aria-label="Close Fexo Mirror" title="Close" onClick={onClose}>
        &times;
      </button>
      <div className="fx-mirror-inner">
        <h3 className="fx-serif" style={{ marginBottom: 6 }}>Fexo Mirror</h3>
        <p className="fx-muted" style={{ fontSize: 13, marginBottom: 18 }}>
          Trying on: {garmentName}
        </p>
        {status === 'error' && <p style={{ color: '#e57373', fontSize: 13 }}>{errorMsg}</p>}
        {status === 'loading' && <p className="fx-muted" style={{ fontSize: 13 }}>Starting camera…</p>}
        <div className="fx-mirror-stage">
          <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
          <canvas ref={canvasRef} className="fx-mirror-canvas" />
        </div>
        <p className="fx-muted" style={{ fontSize: 11, marginTop: 14 }}>
          Stand back so your shoulders and hips are in frame. This is an approximate preview, not an exact fit.
        </p>
      </div>
    </div>
  );
}