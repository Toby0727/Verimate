// Product rule values from docs/product-requirements.md
// (see the constants table in specs/001-clickable-flow-demo/data-model.md).

export const SCHOOL_EMAIL_DOMAINS = ["syr.edu", "esf.edu"] as const;

export const MIN_AGE = 18;
export const VERIFICATION_VALID_MONTHS = 12;
export const ADMITTED_GRACE_AFTER_TERM_START_DAYS = 60;

export const DAILY_REQUEST_LIMIT = 10;
export const REQUEST_EXPIRY_DAYS = 14;
export const REQUEST_COOLDOWN_AFTER_DELETE_DAYS = 30;

export const INACTIVE_AUTO_PAUSE_DAYS = 30;

export const SUBLET_STALE_DAYS = 30;
export const SUBLET_CONFIRM_GRACE_DAYS = 7;

export const WEEKLY_FREE_UNLOCKS = 3;
// The requirements only say "the top few"; 3 is an assumption.
export const TOP_MATCHES_MEMBER_ONLY = 3;

export const FOUNDING_THRESHOLD_VERIFIED = 50;
export const FOUNDING_SEATS = 30;
export const FOUNDING_MIN_ACCOUNT_AGE_DAYS = 7;

export const BOOST_DAYS = 7;
export const MAX_PROFILE_PHOTOS = 6;
export const MAX_PROMPTS = 3;
export const REPORT_SLA_HOURS = 48;

export const PRICES = {
  monthly: { amount: 4.99, label: "$4.99 / month" },
  season: { amount: 9.99, months: 3, label: "$9.99 for 3 months" },
  trialDays: 7,
} as const;

export const FRAUD_KEYWORDS = {
  externalHandle: [
    "wechat",
    "weixin",
    "微信",
    "instagram",
    "insta",
    "ig",
    "whatsapp",
    "telegram",
    "snapchat",
  ],
  payment: [
    "deposit",
    "定金",
    "押金",
    "zelle",
    "venmo",
    "wire",
    "transfer",
    "转账",
    "paypal",
    "cashapp",
    "cash app",
  ],
} as const;
