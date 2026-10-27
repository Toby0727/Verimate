import { FRAUD_KEYWORDS } from "./constants";
import type { FraudSignal } from "./types";

const PHONE_PATTERNS = [
  /\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/, // North American
  /\b1[3-9]\d{9}\b/, // Chinese mobile
];

const HANDLE_PATTERN = /(^|\s)@[a-z0-9_.]{3,}/i;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Latin keywords match whole words only ("transfer", not "transferred");
// Chinese keywords match anywhere.
function hasKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) =>
    /^[ -~]+$/.test(keyword)
      ? new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(text)
      : text.includes(keyword),
  );
}

// Signals that a message moves the conversation off-platform or asks for money.
// The message is still sent; the UI shows a safety tip to both people.
export function detectFraudSignals(text: string): FraudSignal[] {
  const signals: FraudSignal[] = [];
  if (PHONE_PATTERNS.some((p) => p.test(text))) signals.push("phone");
  if (
    HANDLE_PATTERN.test(text) ||
    hasKeyword(text, FRAUD_KEYWORDS.externalHandle)
  ) {
    signals.push("external-handle");
  }
  if (hasKeyword(text, FRAUD_KEYWORDS.payment)) signals.push("payment");
  return signals;
}
