"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VIEW = 280; // crop window, in CSS pixels
const OUTPUT = 640; // saved photo is OUTPUT × OUTPUT
const MAX_ZOOM = 4;

type Offset = { x: number; y: number };

// Keeps the photo covering the whole crop window.
function clamp(offset: Offset, width: number, height: number): Offset {
  const maxX = Math.max(0, (width - VIEW) / 2);
  const maxY = Math.max(0, (height - VIEW) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

// Lets the student drag and zoom their photo inside a round frame before it
// is uploaded, then hands back just the square they framed.
export function PhotoCropper({
  file,
  onCancel,
  onDone,
}: {
  file: File | null;
  onCancel: () => void;
  onDone: (cropped: File) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);

  useEffect(() => {
    setImage(null);
    setFailed(false);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.onerror = () => setFailed(true);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Photo size on screen: fills the window at zoom 1.
  const base = image
    ? VIEW / Math.min(image.naturalWidth, image.naturalHeight)
    : 1;
  const scale = base * zoom;
  const width = (image?.naturalWidth ?? 0) * scale;
  const height = (image?.naturalHeight ?? 0) * scale;

  function setZoomKeepingInside(next: number) {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    setZoom(z);
    if (image) {
      setOffset((o) =>
        clamp(o, image.naturalWidth * base * z, image.naturalHeight * base * z),
      );
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const last = pointers.current.get(e.pointerId);
    if (!last) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      setZoomKeepingInside(
        (pinch.current.zoom * distance) / pinch.current.distance,
      );
      return;
    }
    setOffset((o) =>
      clamp(
        { x: o.x + e.clientX - last.x, y: o.y + e.clientY - last.y },
        width,
        height,
      ),
    );
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  async function confirm() {
    if (!image || !file) return;
    // The window's top-left corner and size, in the photo's own pixels.
    const size = VIEW / scale;
    const sx = image.naturalWidth / 2 - (VIEW / 2 + offset.x) / scale;
    const sy = image.naturalHeight / 2 - (VIEW / 2 + offset.y) / scale;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    canvas
      .getContext("2d")
      ?.drawImage(image, sx, sy, size, size, 0, 0, OUTPUT, OUTPUT);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (blob) onDone(new File([blob], "photo.jpg", { type: "image/jpeg" }));
  }

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Position your photo</DialogTitle>
          <DialogDescription>
            Drag to move it. Pinch or use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-xl bg-muted"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={(e) => setZoomKeepingInside(zoom - e.deltaY / 400)}
        >
          {image && (
            // biome-ignore lint/performance/noImgElement: local blob preview
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
              style={{
                width,
                height,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          )}
          {/* Round frame: everything outside it is dimmed. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-2 rounded-full shadow-[0_0_0_9999px_rgb(0_0_0/0.45)] ring-2 ring-white/80"
          />
          {failed && (
            <p className="absolute inset-0 grid place-items-center p-6 text-center text-[13px] text-muted-foreground">
              We couldn't open that photo. Try a JPG or PNG.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <Minus className="size-4 text-muted-foreground" aria-hidden />
          <input
            type="range"
            aria-label="Zoom"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoomKeepingInside(Number(e.target.value))}
            className="h-1 flex-1 accent-[var(--verified-fill)]"
          />
          <Plus className="size-4 text-muted-foreground" aria-hidden />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!image} onClick={confirm}>
            Use photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
