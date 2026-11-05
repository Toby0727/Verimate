// In-app browsers (Instagram, TikTok, Snapchat...) are where most waitlist
// traffic lands: people tap the link sticker in a story. Google refuses to
// sign in inside these embedded browsers ("Error 403: disallowed_useragent"),
// so the page has to send people to Safari or Chrome first.

export type InAppApp =
  | "Instagram"
  | "Facebook"
  | "Messenger"
  | "TikTok"
  | "Snapchat"
  | "LinkedIn"
  | "WeChat"
  | "LINE"
  | "X"
  | "Reddit"
  | "Discord";

export type Platform = "ios" | "android" | "other";

export type InAppBrowser = { app: InAppApp | null; platform: Platform };

// Order matters: Messenger's user agent also contains the Facebook markers.
const APPS: [InAppApp, RegExp][] = [
  ["Instagram", /\bInstagram\b/i],
  ["Messenger", /\bFBAN\/Messenger|\bMessengerForiOS|\bFB_IAB\/Orca/i],
  ["Facebook", /\bFBAN\/|\bFBAV\/|\bFB_IAB\/|\bFBIOS\b/i],
  ["TikTok", /musical_ly|BytedanceWebview|\bTikTok\b|\btrill_/i],
  ["Snapchat", /\bSnapchat\b/i],
  ["LinkedIn", /\bLinkedInApp\b/i],
  ["WeChat", /\bMicroMessenger\b/i],
  ["LINE", /\bLine\/\d/],
  ["X", /\bTwitter(?:Android)?\b/i],
  ["Reddit", /\bReddit\//i],
  ["Discord", /\bDiscord\//i],
];

export function platformOf(userAgent: string): Platform {
  if (/\b(iPhone|iPad|iPod)\b/.test(userAgent)) return "ios";
  if (/\bAndroid\b/.test(userAgent)) return "android";
  return "other";
}

/**
 * Which in-app browser this is, if any. A plain Android WebView ("; wv)")
 * also can't do Google sign-in, so it counts as one even without a known app.
 */
export function detectInAppBrowser(userAgent: string): InAppBrowser | null {
  const platform = platformOf(userAgent);
  for (const [app, pattern] of APPS) {
    if (pattern.test(userAgent)) return { app, platform };
  }
  if (platform === "android" && /;\s*wv\)/.test(userAgent)) {
    return { app: null, platform };
  }
  return null;
}

/**
 * An Android "open this in Chrome" link for the same page. Chrome picks it
 * up from most in-app browsers; if Chrome is missing, the browser falls back
 * to the page itself.
 */
export function chromeIntentUrl(pageUrl: string): string {
  const url = new URL(pageUrl);
  const rest = `${url.host}${url.pathname}${url.search}`;
  return `intent://${rest}#Intent;scheme=${url.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(pageUrl)};end`;
}

/** Short, app-specific steps for leaving the in-app browser. */
export function openInBrowserSteps(b: InAppBrowser): string {
  const browser = b.platform === "ios" ? "Safari" : "your browser";
  if (b.app === "Instagram") {
    return b.platform === "ios"
      ? "Tap ••• at the top right, then Open in external browser."
      : "Tap ⋮ at the top right, then Open in Chrome.";
  }
  if (b.app === "TikTok" || b.app === "Snapchat") {
    return `Tap ••• or ⋯, then Open in ${browser}.`;
  }
  return `Open the menu (••• or ⋮), then choose Open in ${browser}.`;
}
