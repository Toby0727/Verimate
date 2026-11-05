import { describe, expect, it } from "vitest";
import {
  chromeIntentUrl,
  detectInAppBrowser,
  openInBrowserSteps,
  platformOf,
} from "./in-app-browser";

// Real-world user agent shapes (trimmed).
const UA = {
  instagramIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 357.0.0.25.101 (iPhone15,3; iOS 18_1; en_US; en; scale=3.00; 1290x2796; 653008461)",
  instagramAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.100 Mobile Safari/537.36 Instagram 352.0.0.38.100 Android (34/14; 420dpi; 1080x2400; Google; Pixel 8)",
  facebookIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/482.0.0.40.103;FBBV/650000000;FBDV/iPhone14,2]",
  messengerIos:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/482.0.0.40.103]",
  tiktok:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_36.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US",
  snapchat:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/13.12.0.36 (like Safari/8618.1.15.10.15, panda)",
  wechat:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x18003237) NetType/WIFI Language/zh_CN",
  androidWebview:
    "Mozilla/5.0 (Linux; Android 13; SM-S911U Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36",
  safari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  chromeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
};

describe("detectInAppBrowser", () => {
  it("finds Instagram on iOS and Android", () => {
    expect(detectInAppBrowser(UA.instagramIos)).toEqual({
      app: "Instagram",
      platform: "ios",
    });
    expect(detectInAppBrowser(UA.instagramAndroid)).toEqual({
      app: "Instagram",
      platform: "android",
    });
  });

  it("tells Messenger apart from Facebook", () => {
    expect(detectInAppBrowser(UA.messengerIos)?.app).toBe("Messenger");
    expect(detectInAppBrowser(UA.facebookIos)?.app).toBe("Facebook");
  });

  it("finds TikTok, Snapchat and WeChat", () => {
    expect(detectInAppBrowser(UA.tiktok)?.app).toBe("TikTok");
    expect(detectInAppBrowser(UA.snapchat)?.app).toBe("Snapchat");
    expect(detectInAppBrowser(UA.wechat)?.app).toBe("WeChat");
  });

  it("treats an unknown Android WebView as in-app", () => {
    expect(detectInAppBrowser(UA.androidWebview)).toEqual({
      app: null,
      platform: "android",
    });
  });

  it("leaves real browsers alone", () => {
    expect(detectInAppBrowser(UA.safari)).toBeNull();
    expect(detectInAppBrowser(UA.chromeAndroid)).toBeNull();
    expect(detectInAppBrowser(UA.chromeDesktop)).toBeNull();
  });
});

describe("helpers", () => {
  it("reads the platform", () => {
    expect(platformOf(UA.safari)).toBe("ios");
    expect(platformOf(UA.chromeAndroid)).toBe("android");
    expect(platformOf(UA.chromeDesktop)).toBe("other");
  });

  it("builds a Chrome intent that keeps the path and query", () => {
    const url = chromeIntentUrl(
      "https://www.verimateapp.com/?ref=ABC123&src=ig-story",
    );
    expect(url).toBe(
      "intent://www.verimateapp.com/?ref=ABC123&src=ig-story#Intent;scheme=https;package=com.android.chrome;" +
        "S.browser_fallback_url=https%3A%2F%2Fwww.verimateapp.com%2F%3Fref%3DABC123%26src%3Dig-story;end",
    );
  });

  it("gives Instagram-specific steps", () => {
    expect(openInBrowserSteps({ app: "Instagram", platform: "ios" })).toContain(
      "Open in external browser",
    );
    expect(
      openInBrowserSteps({ app: "Instagram", platform: "android" }),
    ).toContain("Open in Chrome");
    expect(openInBrowserSteps({ app: null, platform: "ios" })).toContain(
      "Safari",
    );
  });
});
