"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon } from "@/components/ui/Icons";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  disabled?: boolean;
}

interface ImageCaptureInstance {
  takePhoto: () => Promise<Blob>;
}

type ImageCaptureConstructor = new (
  track: MediaStreamTrack,
) => ImageCaptureInstance;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Camera image could not be read."));
    });
    reader.addEventListener("error", () =>
      reject(new Error("Camera image could not be read.")),
    );
    reader.readAsDataURL(blob);
  });
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
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
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not open the camera. Allow camera access and try again.",
        );
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  function captureCanvasFrame(video: HTMLVideoElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The camera frame could not be captured.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || !ready) return;

    setCapturing(true);
    setError(null);
    try {
      const track = stream.getVideoTracks()[0];
      const ImageCaptureApi = (
        window as Window & { ImageCapture?: ImageCaptureConstructor }
      ).ImageCapture;

      let dataUrl: string;
      if (ImageCaptureApi && track) {
        try {
          const photo = await new ImageCaptureApi(track).takePhoto();
          dataUrl = await blobToDataUrl(photo);
        } catch {
          dataUrl = captureCanvasFrame(video);
        }
      } else {
        dataUrl = captureCanvasFrame(video);
      }

      stopStream();
      onCapture(dataUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The photo could not be captured. Try again.",
      );
    } finally {
      setCapturing(false);
    }
  }

  async function useSampleEvidence() {
    setError(null);
    setCapturing(true);
    try {
      const response = await fetch("/mock/reports/mixed-1.jpg");
      if (!response.ok) throw new Error("Sample evidence could not be loaded.");
      stopStream();
      onCapture(await blobToDataUrl(await response.blob()));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Sample evidence could not be loaded.",
      );
    } finally {
      setCapturing(false);
    }
  }

  if (error && !ready) {
    return (
      <div className="rounded-[18px] border border-mist bg-snow p-7 text-sm">
        <div className="grid size-11 place-items-center rounded-[7px] bg-obsidian text-snow">
          <CameraIcon className="size-5" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-obsidian">
          Camera access is required
        </h2>
        <p className="mt-2 max-w-[55ch] leading-relaxed text-steel">{error}</p>
        <p className="mt-4 text-xs leading-relaxed text-fog">
          Gallery uploads remain disabled for this POC. Allow camera permission
          in your browser settings, then reload this page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-[10px] border border-[#e4e4e7] bg-[#ffffff]/95 p-4 shadow-[0_12px_28px_rgba(9,9,11,0.07)] backdrop-blur">
        <CameraIcon className="mt-0.5 size-5 shrink-0 text-iron" />
        <div>
          <p className="text-sm font-medium text-obsidian">
            One live overview photo
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fog">
            Stand approximately 2–3 metres away and frame the entire dumping
            area. Avoid faces and vehicle plates where possible.
          </p>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-obsidian shadow-[0_20px_44px_rgba(9,9,11,0.16)]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {!ready && (
          <div
            className="absolute inset-0 grid place-items-center text-sm text-snow/80"
            aria-live="polite"
          >
            Opening live camera…
          </div>
        )}
        <div className="pointer-events-none absolute inset-[12%] rounded-[12px] border border-snow/75" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-obsidian/80 px-3 py-1.5 text-[11px] font-medium text-snow">
          Live camera
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-graphite" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!ready || disabled || capturing}
        onClick={() => void capturePhoto()}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#D2222B] px-5 py-3.5 text-sm font-medium text-white shadow-[0_8px_18px_rgba(210,34,43,0.24)] hover:-translate-y-0.5 hover:bg-[#a91824] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <CameraIcon className="size-4" />
        {capturing ? "Capturing photo…" : "Capture photo"}
      </button>
      <button
        type="button"
        disabled={disabled || capturing}
        onClick={() => void useSampleEvidence()}
        className="mt-2 inline-flex w-full items-center justify-center rounded-[7px] border border-[#e4e4e7] bg-[#ffffff] px-5 py-3 text-sm font-medium text-[#6e5c4b] hover:border-[#D2222B] hover:text-[#a91824] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Use sample dumping evidence
      </button>
    </div>
  );
}
