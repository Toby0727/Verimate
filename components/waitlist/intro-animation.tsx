"use client";

import { type CSSProperties, type ReactNode, useEffect } from "react";
import { MARK_PATHS } from "@/components/brand/logo";
import { detectInAppBrowser } from "@/lib/rules/in-app-browser";
import {
  BACKDROP_OUT,
  DONE,
  INTRO_SEEN_KEY,
  OUT_AT,
  T,
} from "./intro-timeline";

// First-visit intro (2026-11-06, v4 "meeting point"). After v3 was called
// tacky, we looked at how calm, well-made brands do this (Airbnb, Linear,
// Stripe, Headspace, GitHub's globe, Monzo; Material / Carbon / Apple motion
// guidance) and kept to their rules: one still page in the site's own grey,
// text that rises out of a mask, one thing moving at a time, no overshoot,
// blur, shake, flashes, glows or particles. Persimmon means Verimate: it
// doesn't appear until Verimate enters the story.
//
// On a row of four white blocks (the neighbourhood):
// 1. "Your sublet / is right / around you."
// 2. Students appear as small ink figures; one is going abroad in spring (with
//    a suitcase), one needs a room. "Three blocks apart. / Never met."
// 3. Both get the verified check, their persimmon lines reach toward each
//    other and write the two strokes of the Verimate check. "They meet /
//    on Verimate."
// 4. She leaves; her empty room still shows $950/mo; the subletter's rent
//    flows along their lines into it, the room fills persimmon and the
//    subletter moves in. "No rent wasted. / Money saved."
// 5. The room slides to the middle, widens into a house and gets a roof.
//    "Find your / match."
// 6. The check flies into the page's own logo as the grey fades away.
//
// This component only renders the overlay, hidden by default. Whether it
// plays, and when it starts and ends, is decided by INTRO_SCRIPT in the root
// layout's <head> (see intro-timeline.ts), so it is on screen from the first
// paint. The animation is one CSS timeline (the "First-visit intro" block in
// app/globals.css): each element's animation starts at its --t (ms) and
// leaves at its --u, so frames can be scrubbed with document.getAnimations().

const ORANGE = "#f8672e";
const INK = "#111";

/** Inline style: when an element comes in (--t) and, optionally, goes (--u). */
function at(t: number, u?: number, extra?: CSSProperties): CSSProperties {
  return {
    "--t": Math.round(t),
    ...(u === undefined ? {} : { "--u": Math.round(u) }),
    ...extra,
  } as CSSProperties;
}

// The figure is a fixed 342 × 228 px box; everything in it is placed in px.
const BLOCK_X = [0, 88, 176, 264];
const BLOCK_Y = 28;

// Where each student's line runs: from under their dot to the top of one
// stroke of the check (short stroke on the left, long on the right).
const ROUTES = [
  { id: "left", d: "M39 100 C39 162 140 142 154.2 177.4" },
  { id: "right", d: "M303 100 C303 154 200 130 189.4 166.1" },
];

// The rent's way from the subletter (right) to her room (left): down the
// right line, round the check (long stroke down, short stroke up) and back
// up the left line into her room. Coins travel it on CSS offset-path.
const MONEY_PATH =
  "M303 100 C303 154 200 130 189.4 166.1 L183.1 182.3 L171.4 202.8 L164.4 203.7 L161.8 199.8 L157.5 191 L154.2 177.4 C140 142 39 162 39 100";

// Centre lines of the check's two strokes (in its 64-unit box), drawn from
// the top down to where they meet; each one uncovers its stroke.
const STROKES = [
  {
    id: "long",
    path: MARK_PATHS[1],
    centre: "M53.5 11 L45.8 30 L32.5 53.5",
    t: T.strokeLong,
    ms: 360,
  },
  {
    id: "short",
    path: MARK_PATHS[0],
    centre: "M12.8 24.5 L16.6 40 L21.5 50 L24.5 54.5",
    t: T.strokeShort,
    ms: 300,
  },
];

export function IntroAnimation() {
  useEffect(() => {
    // Any load of the waitlist in this tab counts as having played the
    // intro, even one where it didn't (reached by a link, ?intro=0), so a
    // later full load in the same tab, like coming back from Google sign-in,
    // doesn't start it.
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Storage blocked: the intro never plays there anyway.
    }
    // In Instagram & co the page asks people to reopen it in Safari or
    // Chrome, which has its own storage. Mark the URL so the intro doesn't
    // play there (Copy link and the Chrome link read the URL after this).
    if (!detectInAppBrowser(navigator.userAgent)) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("intro") === "0") return;
    url.searchParams.set("intro", "0");
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <div
      className="intro fixed inset-0 z-[60] touch-none overflow-hidden overscroll-none"
      style={at(DONE)}
    >
      <div className="intro-bg" style={at(OUT_AT)} />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Figure />
        <div className="intro-copy text-[#111]">
          <Lines
            type="display"
            t={T.tagline}
            u={T.taglineOut}
            lines={[
              "Your sublet",
              "is right",
              <Rust key="r">around you.</Rust>,
            ]}
            first
          />
          <Lines
            type="headline"
            t={T.apart}
            u={T.apartOut}
            lines={["Three blocks apart.", "Never met."]}
          />
          <Lines
            type="headline"
            t={T.meet}
            u={T.meetOut}
            lines={["They meet", "on Verimate."]}
          />
          <Lines
            type="headline"
            t={T.covered}
            u={T.coveredOut}
            lines={["No rent wasted.", "Money saved."]}
          />
          <Lines
            type="display"
            t={T.home}
            u={T.homeOut}
            lines={["Find your", <Rust key="r">match.</Rust>]}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0">
        <div className="mx-auto flex max-w-[520px] justify-end px-2 pt-4">
          <button
            type="button"
            className="intro-skip-button intro-hide pointer-events-auto flex min-h-11 items-center px-2"
            style={at(BACKDROP_OUT)}
          >
            <span className="rounded-full bg-white px-4 font-semibold text-[#111] text-[14px] leading-9">
              Skip<span className="sr-only"> intro</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Rust({ children }: { children: ReactNode }) {
  return <span className="text-[#bf4306]">{children}</span>;
}

// Lines of type that rise out of a mask (staggered) and later leave upward
// through it. Every set of lines shares one slot under the figure.
function Lines({
  type,
  t,
  u,
  lines,
  first = false,
}: {
  type: "display" | "headline";
  t: readonly number[];
  u: number;
  lines: ReactNode[];
  first?: boolean;
}) {
  return (
    // The script waits for this font (the first line's) before starting.
    <div className={`intro-lines intro-${type} ${first ? "intro-type" : ""}`}>
      {lines.map((line, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed lines, never reordered
          key={i}
          className="intro-line"
        >
          <span className="intro-line-in" style={at(t[i], u + 30 * i)}>
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="5 6 54 52"
      fill={ORANGE}
      className={className}
    >
      <path d={MARK_PATHS[0]} />
      <path d={MARK_PATHS[1]} />
    </svg>
  );
}

// The neighbourhood: four white blocks with the students in them, the
// lines between two of them and the check they write.
function Figure() {
  return (
    <div className="intro-figure">
      {/* Speech bubbles over the two students the story follows */}
      <div
        className="intro-label absolute -top-[10px] left-0"
        style={at(T.labels[0], T.meetOut, {
          "--w": T.badges[0],
        } as CSSProperties)}
      >
        Abroad in spring
        <span className="intro-badge" style={at(T.badges[0])}>
          <Check className="h-[14px] w-auto" />
        </span>
      </div>
      <div
        className="intro-label intro-label-right absolute -top-[10px] right-0"
        style={at(T.labels[1], T.meetOut, {
          "--w": T.badges[1],
        } as CSSProperties)}
      >
        Needs a room
        <span className="intro-badge" style={at(T.badges[1])}>
          <Check className="h-[14px] w-auto" />
        </span>
      </div>

      {/* b2–b4 (b1 is her room, below) */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="intro-block-out absolute"
          style={{
            ...at(T.blocks[i], T.clear[i - 1]),
            left: BLOCK_X[i],
            top: BLOCK_Y,
          }}
        >
          <div className="intro-block-in" style={at(T.blocks[i])}>
            <div className="intro-block" />
            {i === 3 ? (
              // The student who needs a room: leaves this block for hers
              <Person size={28} t={T.dots[3]} u={T.seekerOut} out="fade" />
            ) : (
              <Person size={22} t={T.dots[i]} />
            )}
          </div>
        </div>
      ))}

      {/* The check they write */}
      <div
        className="intro-fly absolute top-[156px] left-[143px]"
        style={at(T.flight)}
      >
        <svg aria-hidden="true" viewBox="0 0 64 64" className="block size-14">
          <defs>
            {STROKES.map((s) => (
              <mask
                key={s.id}
                id={`intro-stroke-${s.id}`}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="64"
                height="64"
              >
                <path
                  d={s.centre}
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={18}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="intro-reveal"
                  style={at(s.t, undefined, {
                    "--ms": `${s.ms}ms`,
                  } as CSSProperties)}
                />
              </mask>
            ))}
          </defs>
          {STROKES.map((s) => (
            <path
              key={s.id}
              d={s.path}
              fill={ORANGE}
              mask={`url(#intro-stroke-${s.id})`}
            />
          ))}
        </svg>
      </div>

      <Room />
      {/* Their lines: above her room, so both start right under the dot */}
      <svg
        aria-hidden="true"
        viewBox="0 0 342 228"
        className="absolute inset-0 z-[2] h-full w-full overflow-visible"
        fill="none"
      >
        {ROUTES.map((r) => (
          <path
            key={r.id}
            d={r.d}
            pathLength={1}
            stroke={ORANGE}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="intro-route"
            style={at(T.routes, T.coveredOut)}
          />
        ))}
      </svg>
      {/* The rent, flowing from the subletter into her room */}
      {T.coins.map((t) => (
        <span
          key={t}
          className="intro-coin"
          style={at(t, undefined, { offsetPath: `path("${MONEY_PATH}")` })}
        >
          $
        </span>
      ))}
    </div>
  );
}

// b1, her room. She leaves, the rent stays, the subletter moves in, the room
// fills, slides to the middle and becomes a house.
function Room() {
  return (
    <div
      className="intro-room absolute"
      style={{ ...at(T.room, T.homeOut), left: BLOCK_X[0], top: BLOCK_Y }}
    >
      {/* The house's body: widens out from under the room */}
      <div className="intro-house" style={at(T.widen)} />
      <div className="intro-block-in" style={at(T.blocks[0])}>
        {/* Fades once the house is wide, so its edge doesn't show as a seam */}
        <div
          className="intro-block intro-room-shell"
          style={at(T.blocks[0], T.widen + 450)}
        >
          <div className="intro-fill" style={at(T.fill)} />
        </div>
        <Person size={28} t={T.dots[0]} u={T.leave} out="up" bag />
        <Person size={28} t={T.seekerIn} />
        <span
          className="intro-rent absolute top-[12px] left-1/2 -translate-x-1/2"
          style={at(T.rent, T.coveredOut)}
        >
          $950/mo
        </span>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 78 104"
        className="absolute top-0 left-0 h-[104px] w-[78px] overflow-visible"
      >
        <path
          // 140 wide over the 124 body, pitched about 37°
          d="M-27 14 L39 -36 L105 14 Z"
          fill={ORANGE}
          stroke={ORANGE}
          strokeWidth={8}
          strokeLinejoin="round"
          className="intro-roof"
          style={at(T.roof)}
        />
      </svg>
    </div>
  );
}

// A student: a small ink figure (head and shoulders) in the middle of their
// block. `bag` gives her a suitcase: she's the one going abroad.
function Person({
  size,
  t,
  u,
  out,
  bag = false,
}: {
  size: number;
  t: number;
  u?: number;
  out?: "up" | "fade";
  bag?: boolean;
}) {
  const leave =
    out === "up"
      ? "intro-person-leave"
      : out === "fade"
        ? "intro-person-fade"
        : "";
  return (
    <span
      className={`intro-person ${leave}`}
      style={at(t, u, { width: size, height: size * 1.2 })}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 24"
        fill={INK}
        className="block size-full"
      >
        <circle cx="10" cy="5.5" r="5" />
        <path d="M1 24 C1 17 5 12.5 10 12.5 C15 12.5 19 17 19 24 Z" />
      </svg>
      {bag && (
        <svg
          aria-hidden="true"
          viewBox="0 0 9 11"
          className="absolute bottom-0 left-[calc(100%+3px)] h-[15px] w-[12px]"
        >
          <path
            d="M3 3.5 V1.3 H6 V3.5"
            fill="none"
            stroke={INK}
            strokeWidth={1.4}
          />
          <rect x="0" y="3" width="9" height="8" rx="1.6" fill={INK} />
        </svg>
      )}
    </span>
  );
}
