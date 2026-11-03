"use client";

import { Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RAFFLE } from "@/lib/waitlist/options";

function timeLeft(now: number): { days: number; hours: number } | null {
  const ms = new Date(RAFFLE.endsAt).getTime() - now;
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  return { days: Math.floor(hours / 24), hours: hours % 24 };
}

// Ticks once a minute; null until mounted so server and client agree.
function useTimeLeft() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now === null ? undefined : timeLeft(now);
}

function Countdown() {
  const left = useTimeLeft();
  if (left === undefined) return <span className="opacity-0">…</span>;
  if (left === null) return <span>Entries closed</span>;
  return (
    <span>
      <b className="font-semibold tabular-nums">{left.days}</b>d{" "}
      <b className="font-semibold tabular-nums">{left.hours}</b>h left to enter
    </span>
  );
}

// The prize, drawn as a crimson gift card with a ribbon, a sweeping shine
// and a shake every few seconds.
export function GiftCard({ entries }: { entries?: number }) {
  return (
    <div className="hype-pop">
      <div className="hype-wiggle-soft">
        <div className="hype-shine relative overflow-hidden rounded-2xl bg-verified-fill p-5 text-white shadow-[0_12px_30px_-12px_rgb(184_40_58/0.7)]">
          {/* Ribbon */}
          <span
            aria-hidden
            className="absolute inset-y-0 right-14 w-5 bg-white/15"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 top-[42%] h-5 bg-white/15"
          />
          <div className="relative flex items-start justify-between">
            <span className="font-semibold text-[11px] tracking-[0.14em] uppercase opacity-90">
              Waitlist raffle
            </span>
            <span className="hype-wiggle grid size-10 place-items-center rounded-full bg-white text-verified-fill">
              <Gift className="size-5" strokeWidth={2.4} />
            </span>
          </div>
          <div className="relative mt-3 flex items-end gap-2">
            <span className="font-bold text-[64px] leading-none tracking-tight">
              $50
            </span>
            <span className="pb-2 font-medium text-[15px] leading-tight">
              Amazon
              <br />
              gift card
            </span>
          </div>
          <div className="relative mt-4 flex items-center justify-between gap-2 text-[13px]">
            <span className="rounded-full bg-black/20 px-2.5 py-1">
              <Countdown />
            </span>
            {entries ? (
              <span className="opacity-90">
                You have {entries} {entries === 1 ? "entry" : "entries"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// The header pill: the gift icon shakes every few seconds.
export function RafflePill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "hype-pulse inline-flex items-center gap-1.5 rounded-full bg-verified-tint px-2.5 py-1 font-medium text-[12px] text-verified",
        className,
      )}
    >
      <Gift className="hype-wiggle size-3.5" />
      Win a {RAFFLE.prize}
    </span>
  );
}

const CONFETTI_COLORS = ["#b8283a", "#111111", "#f3b5bd", "#e46a7a"];

// A one-time burst of confetti over the "You're entered!" card.
export function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible"
    >
      {Array.from({ length: 28 }, (_, i) => {
        const left = (i * 37) % 100;
        const style = {
          left: `${left}%`,
          backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          "--delay": `${(i % 7) * 0.06}s`,
          "--fall": `${1.4 + (i % 5) * 0.2}s`,
          "--drift": `${((i % 9) - 4) * 14}px`,
          "--spin": `${360 + (i % 4) * 160}deg`,
        } as React.CSSProperties;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative pieces
            key={i}
            style={style}
            className={cn(
              "hype-confetti absolute top-0 block opacity-0",
              i % 3 === 0 ? "h-2 w-2 rounded-full" : "h-3 w-1.5 rounded-sm",
            )}
          />
        );
      })}
    </div>
  );
}
