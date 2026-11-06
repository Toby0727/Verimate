"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUT_AT } from "./intro-timeline";

// Sound for the first-visit intro (2026-11-06). One file, synced to the
// timeline: its 0 s is the timeline's 0 ms (made by the same script as the
// intro video's sound track, see docs/journal.md). INTRO_SCRIPT stores when
// the timeline started in window.__vmIntroT0, so the sound can join at the
// right point whenever it starts.
//
// Browsers don't let a page play sound before the visitor has tapped
// anything, and a QR scan is a fresh page, so it usually starts muted: the
// speaker button next to Skip turns it on from where the animation is. Where
// the browser does allow it (some desktop browsers), it plays on its own.
export const INTRO_SOUND_SRC = "/intro/intro-sfx.mp3";

declare global {
  interface Window {
    __vmIntroT0?: number;
  }
}

/** Seconds into the timeline, or null before it starts. */
function elapsed(): number | null {
  const t0 = window.__vmIntroT0;
  return t0 === undefined ? null : (performance.now() - t0) / 1000;
}

export function useIntroSound() {
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const start = useCallback(async () => {
    const a = audio.current;
    const e = elapsed();
    // Nothing left to hear once the page is showing.
    if (!a || e === null || e * 1000 >= OUT_AT) return false;
    try {
      a.currentTime = e;
      await a.play();
      setOn(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const d = document.documentElement;
    if (d.getAttribute("data-intro") !== "play") return;
    const a = new Audio(INTRO_SOUND_SRC);
    a.preload = "auto";
    audio.current = a;
    let tried = false;
    const sync = () => {
      if (d.getAttribute("data-intro") === "skip") {
        a.pause();
        setOn(false);
        return;
      }
      // Try once when the timeline starts; usually blocked until a tap.
      if (!tried && d.hasAttribute("data-intro-run")) {
        tried = true;
        void start();
      }
    };
    const watch = new MutationObserver(sync);
    watch.observe(d, {
      attributes: true,
      attributeFilter: ["data-intro", "data-intro-run"],
    });
    sync();
    return () => {
      watch.disconnect();
      a.pause();
      audio.current = null;
    };
  }, [start]);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (on) {
      a.pause();
      setOn(false);
    } else {
      void start();
    }
  }, [on, start]);

  return { on, toggle };
}
