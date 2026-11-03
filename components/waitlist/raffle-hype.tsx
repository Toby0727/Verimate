"use client";

import { Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RAFFLE } from "@/lib/waitlist/options";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function timeLeft(now: number): TimeLeft | null {
  const total = Math.floor((new Date(RAFFLE.endsAt).getTime() - now) / 1000);
  if (total <= 0) return null;
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor(total / 3_600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

// Ticks every second; undefined until mounted so server and client agree.
function useTimeLeft() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now === null ? undefined : timeLeft(now);
}

const pad = (n: number) => String(n).padStart(2, "0");

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="min-w-[2ch] rounded-md bg-black/25 px-1.5 py-0.5 text-center font-semibold text-[18px] tabular-nums leading-tight">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider opacity-75">
        {label}
      </span>
    </span>
  );
}

// Days, hours, minutes and seconds until entries close.
function Countdown() {
  const left = useTimeLeft();
  if (left === undefined) return <div className="h-[42px]" />;
  if (left === null) return <span className="text-[13px]">Entries closed</span>;
  return (
    <div
      role="timer"
      aria-label={`${left.days} days ${left.hours} hours left to enter`}
      className="flex items-start gap-1.5"
    >
      <Unit value={String(left.days)} label="days" />
      <Colon />
      <Unit value={pad(left.hours)} label="hrs" />
      <Colon />
      <Unit value={pad(left.minutes)} label="min" />
      <Colon />
      <Unit value={pad(left.seconds)} label="sec" />
    </div>
  );
}

function Colon() {
  return (
    <span aria-hidden className="pt-0.5 font-semibold text-[18px] opacity-70">
      :
    </span>
  );
}

// The prize, drawn as a crimson gift card with a ribbon, a sweeping shine
// and a shake every few seconds.
export function GiftCard({
  entries,
  boost = 0,
}: {
  entries?: number;
  // Extra chance from referrals, in percent.
  boost?: number;
}) {
  return (
    <div className="hype-pop">
      <div className="hype-wiggle-soft">
        <div className="hype-shine relative overflow-hidden rounded-[20px] bg-verified-fill p-5 text-white shadow-[0_18px_40px_-24px_rgb(120_20_32/0.9)] ring-1 ring-white/15 ring-inset">
          {/* Fine ribbon lines and an inner frame, like a printed card. */}
          <span
            aria-hidden
            className="absolute inset-y-0 right-[3.25rem] w-px bg-white/30"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 top-[44%] h-px bg-white/30"
          />
          <span
            aria-hidden
            className="absolute inset-2 rounded-[14px] border border-white/10"
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
            <span className="font-bold text-[64px] leading-none tracking-[-0.03em]">
              $50
            </span>
            <span className="pb-2 font-medium text-[15px] leading-tight">
              Amazon
              <br />
              gift card
            </span>
          </div>
          <div className="relative mt-4 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.14em] opacity-80">
                Entries close in
              </span>
              <Countdown />
            </div>
            {entries ? (
              <span className="text-right text-[13px] leading-tight opacity-90">
                {entries} {entries === 1 ? "entry" : "entries"}
                {boost > 0 && (
                  <>
                    <br />
                    <b>+{boost}% from friends</b>
                  </>
                )}
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
