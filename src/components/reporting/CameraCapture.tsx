"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Live camera is not supported in this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
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
          setReady(true);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not open the camera. Allow camera access to report.",
        );
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    stopStream();
    onCapture(dataUrl);
  }

  if (error) {
    return (
      <div className="rounded-xl border border-selangor-red/25 bg-selangor-red-soft/40 p-6 text-sm text-selangor-ink">
        <p className="font-medium text-selangor-red-deep">Camera required</p>
        <p className="mt-2 leading-relaxed text-selangor-ink/75">{error}</p>
        <p className="mt-3 text-xs text-selangor-ink/55">
          Gallery / file upload is disabled to reduce fake reports. Use a device
          with a working camera, or allow permission and reload.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-selangor-red/15 bg-selangor-ink">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-primary-foreground/80">
            Opening live camera…
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/45 to-transparent px-4 py-3 text-xs text-white/90">
          Live camera only · gallery upload blocked
        </div>
      </div>
      <button
        type="button"
        disabled={!ready || disabled}
        onClick={captureFrame}
        className="w-full rounded-md bg-selangor-red px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-selangor-red-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        Capture photo
      </button>
    </div>
  );
}
