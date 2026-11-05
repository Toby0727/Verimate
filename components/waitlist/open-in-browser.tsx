"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  chromeIntentUrl,
  detectInAppBrowser,
  type InAppBrowser,
  openInBrowserSteps,
} from "@/lib/rules/in-app-browser";

/**
 * The in-app browser the page is open in, if any (null in Safari, Chrome
 * and on desktop). Read after mount so the server render never guesses.
 * `npm run dev` only: ?inapp=ios or ?inapp=android pretends to be Instagram.
 */
export function useInAppBrowser(): InAppBrowser | null {
  const [browser, setBrowser] = useState<InAppBrowser | null>(null);
  useEffect(() => {
    const fake =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(window.location.search).get("inapp")
        : null;
    if (fake === "ios" || fake === "android") {
      setBrowser({ app: "Instagram", platform: fake });
      return;
    }
    setBrowser(detectInAppBrowser(navigator.userAgent));
  }, []);
  return browser;
}

/**
 * Shown instead of the Google button inside Instagram and other in-app
 * browsers, where Google blocks sign-in. Gets people to a real browser with
 * the same link (referral and source codes included).
 */
export function OpenInBrowser({
  browser,
  onTryAnyway,
}: {
  browser: InAppBrowser;
  onTryAnyway: () => void;
}) {
  const browserName = browser.platform === "ios" ? "Safari" : "Chrome";
  const appName = browser.app ?? "this app";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(`Link copied. Paste it into ${browserName}.`);
    } catch {
      toast.error("Couldn't copy. Press and hold the address to copy it.");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-verified-tint p-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[17px] text-foreground leading-snug">
          Open in {browserName} to sign in
        </span>
        <span className="text-[14px] text-muted-foreground leading-snug">
          Google doesn't allow signing in inside {appName}'s browser.{" "}
          {openInBrowserSteps(browser)}
        </span>
      </div>
      {browser.platform === "android" ? (
        <a
          href={chromeIntentUrl(window.location.href)}
          className={buttonVariants({ size: "lg" })}
        >
          <ExternalLink />
          Open in Chrome
        </a>
      ) : null}
      <Button
        size="lg"
        variant={browser.platform === "android" ? "outline" : "default"}
        className={browser.platform === "android" ? "bg-white" : undefined}
        onClick={copyLink}
      >
        <Copy />
        Copy link
      </Button>
      <button
        type="button"
        onClick={onTryAnyway}
        className="self-start text-[13px] text-muted-foreground underline underline-offset-2"
      >
        Try Google sign-in here anyway
      </button>
    </div>
  );
}
