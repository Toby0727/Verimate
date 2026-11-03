"use client";

import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PHOTO_MAX_BYTES,
  uploadWaitlistPhoto,
  type WaitlistSession,
  waitlistPhotoUrl,
} from "@/lib/waitlist/api";
import { PhotoCropper } from "./photo-cropper";

// Optional photo of the student. Uploading one earns a bonus raffle entry.
export function PhotoPicker({
  session,
  path,
  onChange,
}: {
  session: Extract<WaitlistSession, { status: "signed-in" }>;
  path: string | null;
  onChange: (path: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropping, setCropping] = useState<File | null>(null);

  // Show a photo saved on an earlier visit.
  useEffect(() => {
    if (!path || src) return;
    let cancelled = false;
    waitlistPhotoUrl(path).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [path, src]);

  // A picked photo goes to the cropper first; only the framed square is
  // uploaded.
  function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toast.error("That photo is over 20 MB. Try a smaller one.");
      return;
    }
    setCropping(file);
  }

  async function upload(file: File) {
    setCropping(null);
    setUploading(true);
    try {
      onChange(await uploadWaitlistPhoto(session, file));
      setSrc(URL.createObjectURL(file));
    } catch {
      toast.error("Couldn't upload your photo. Try a JPG or PNG.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl bg-verified-tint p-3">
      <button
        type="button"
        aria-label={path ? "Change photo" : "Upload photo"}
        onClick={() => input.current?.click()}
        className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white"
      >
        {src ? (
          // biome-ignore lint/performance/noImgElement: blob and signed URLs
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <Camera className="size-6 text-muted-foreground" />
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-semibold text-[14px]">
          {path ? "Bonus entry added" : "Upload a real photo of you"}
        </span>
        <span className="text-[12px] text-verified">
          {path
            ? "One more entry for the gift card raffle."
            : "Real photos get a bonus raffle entry for the gift card."}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="mt-1 self-start bg-white"
          disabled={uploading}
          onClick={() => input.current?.click()}
        >
          {uploading && <Loader2 className="animate-spin" />}
          {path ? "Change photo" : "Upload photo"}
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <PhotoCropper
        file={cropping}
        onCancel={() => setCropping(null)}
        onDone={upload}
      />
    </div>
  );
}
