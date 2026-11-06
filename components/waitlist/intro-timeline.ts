// Timeline of the first-visit intro (intro-animation.tsx), and the inline
// script that runs it. A plain module, not "use client", so the root layout
// can put INTRO_SCRIPT in <head>.
//
// Why a script in <head>: the intro has to be on screen from the first
// paint, not pop in once React has loaded. INTRO_SCRIPT runs while the HTML
// is parsed, so it never waits for the app's JavaScript:
// - It decides. On "/" only, every time the site is opened (once per tab:
//   sessionStorage), never with reduced motion, blocked storage or a screen too
//   small for the 342px figure, it sets <html data-intro="play">. `?intro`
//   replays it, `?intro=0` turns it off. CSS only shows the overlay
//   (rendered in the server HTML) in that state, and locks page scrolling.
// - Once the page is parsed it holds every animation on its first frame
//   until the font is ready (at most FONT_WAIT), starts the timeline
//   (data-intro-run), measures where the check has to fly to, sets
//   data-intro="done" at the end, and wires Skip.
// It lives in the root layout, which React never re-renders on navigation:
// React doesn't run <script> tags it creates on the client, and warns about
// them in development.

// In sessionStorage: it plays every time someone opens the site (decided
// 2026-11-06), but only once per tab, so coming back from Google sign-in in
// the same tab doesn't play it again before the survey.
export const INTRO_SEEN_KEY = "verimate-intro-seen";

// The timeline, in ms from when it starts. One still page; only the story
// moves (see intro-animation.tsx).
export const T = {
  // 1. "Your sublet / is right / around you." and the four blocks.
  tagline: [80, 170, 260],
  blocks: [650, 700, 750, 800],
  taglineOut: 1850,
  // 2. Students in the blocks, two labels: "Three blocks apart. Never met."
  dots: [1930, 1990, 2050, 2110],
  labels: [2110, 2170],
  apart: [2200, 2300],
  apartOut: 3250,
  // 3. Verified, their lines reach each other and write the check:
  //    "They meet on Verimate."
  routes: 3290,
  badges: [3370, 3410],
  meet: [3410, 3510],
  strokeLong: 3910,
  strokeShort: 3970,
  meetOut: 4600,
  // 4. She leaves, her room shows $950/mo, the subletter's rent flows along
  //    their lines (right to left, through the check) into it, the room
  //    fills and the subletter moves in: "No rent wasted. Money saved."
  leave: 4640,
  rent: 4740,
  covered: [4800, 4900],
  coins: [4860, 4990, 5120],
  fill: 5560,
  seekerOut: 5700,
  seekerIn: 5850,
  coveredOut: 6400,
  // 5. Everything else clears, the room slides to the middle, widens into a
  //    house and gets a roof: "Find your match."
  clear: [6400, 6430, 6460],
  room: 6460,
  home: [6600, 6700],
  widen: 6820,
  roof: 7040,
  homeOut: 7800,
  // 6. The check flies into the page's own logo.
  flight: 7880,
} as const;

/** The grey fades and the page shows round the flying check. */
export const OUT_AT = 8130;
/** The page underneath is revealed (and its entrance animation runs). */
export const BACKDROP_OUT = OUT_AT;
const FADE_MS = 400;
/** The overlay is gone and the page's own check shows under the flown one. */
export const DONE = OUT_AT + FADE_MS;
const SKIP_MS = 300;
/** Longest the first frame waits for the font before starting anyway. */
const FONT_WAIT = 900;
/** Smallest screen the figure fits on. */
const MIN_W = 344;
const MIN_H = 530;

// In order:
// - mark(): remembers the intro as played in this tab. `?intro=0` counts as
//   played.
// - data-intro="play" on the first load of "/" in a tab, without reduced motion, on a
//   screen big enough.
// - fly(): measures the page logo's check ([data-logo-mark]) and the intro's
//   check, and sets the translate and scale that land one on the other
//   (--fly-x, --fly-y, --fly-s on <html>, which React leaves alone; on
//   .intro-fly itself they'd be a hydration mismatch). Measured when the timeline starts and again just before the
//   flight (the page may have shifted while React loaded). If there's no
//   logo, data-intro-nofly makes the check fade with the grey instead.
// - Skip works from the start (one delegated listener) and is ignored once
//   the overlay has started to leave. Focus moves to the page's first
//   button when the fade ends, not at once: buttons with transition-all
//   are still mid-transition from visibility: hidden on the first frame,
//   and a hidden element can't take focus.
// - A background tab or prerender waits until it's shown before starting.
// - data-intro-out when the overlay starts to leave (or on Skip) reveals the
//   page under it: until then it is hidden from screen readers and the tab
//   order, and its entrance animation waits.
export const INTRO_SCRIPT = `(function(){var d=document.documentElement;function mark(){try{sessionStorage.setItem("${INTRO_SEEN_KEY}","1")}catch(e){}}try{if(location.pathname!=="/")return;var q=new URLSearchParams(location.search).get("intro");if(q==="0"){mark();return}if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(innerWidth<${MIN_W}||innerHeight<${MIN_H})return;if(q===null){if(sessionStorage.getItem("${INTRO_SEEN_KEY}"))return;sessionStorage.setItem("${INTRO_SEEN_KEY}","1")}d.setAttribute("data-intro","play")}catch(e){return}var started=0;function end(){d.setAttribute("data-intro","done")}function out(){d.setAttribute("data-intro-out","")}function fly(){try{var m=document.querySelector("[data-logo-mark]"),w=document.querySelector(".intro-fly"),s=m&&m.ownerSVGElement,f=w&&w.querySelector("svg");if(!s||!f)throw 0;var a=s.getBoundingClientRect(),b=f.getBoundingClientRect();if(!a.height||!b.height)throw 0;d.style.setProperty("--fly-x",a.left-b.left+"px");d.style.setProperty("--fly-y",a.top-b.top+"px");d.style.setProperty("--fly-s",String(a.height/b.height));d.removeAttribute("data-intro-nofly")}catch(e){d.setAttribute("data-intro-nofly","")}}function run(){if(started)return;started=performance.now();fly();d.setAttribute("data-intro-run","");setTimeout(fly,${T.flight - 80});setTimeout(out,${BACKDROP_OUT});setTimeout(function(){if(d.getAttribute("data-intro")==="play")end()},${DONE})}function skip(){if(d.getAttribute("data-intro")!=="play")return;if(started&&performance.now()-started>${OUT_AT})return;out();d.setAttribute("data-intro","skip");setTimeout(function(){end();var f=document.querySelector("main button");if(f)f.focus({preventScroll:true})},${SKIP_MS})}document.addEventListener("click",function(e){var t=e.target;if(t&&t.closest&&t.closest(".intro-skip-button"))skip()});function start(){var el=document.querySelector(".intro-type");if(!el){end();return}try{var s=getComputedStyle(el);document.fonts.load(s.fontWeight+" 1em "+s.fontFamily).then(run,run)}catch(e){run()}setTimeout(run,${FONT_WAIT})}function ready(){if(document.visibilityState!=="hidden"){start();return}document.addEventListener("visibilitychange",function v(){if(document.visibilityState==="hidden")return;document.removeEventListener("visibilitychange",v);start()})}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready()})();`;
