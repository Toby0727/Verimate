import { MIN_AGE, SCHOOL_EMAIL_DOMAINS } from "./constants";
import type { Verification } from "./types";

export type VerificationPath = "student" | "admitted";

export type Badge =
  | "student"
  | "admitted-pending"
  | "admitted"
  | "graduate"
  | "expired"
  | "rejected"
  | "none";

export function isSchoolEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return (
    domain !== undefined &&
    (SCHOOL_EMAIL_DOMAINS as readonly string[]).includes(domain)
  );
}

// One school email can belong to one account only.
export function isEmailTaken(
  email: string,
  verifications: Verification[],
  exceptAccountId?: string,
): boolean {
  const normalized = email.trim().toLowerCase();
  return verifications.some(
    (v) =>
      v.schoolEmail?.toLowerCase() === normalized &&
      v.accountId !== exceptAccountId &&
      v.status !== "rejected",
  );
}

// birthDate is a calendar date ("YYYY-MM-DD"), compared with now's local date.
export function ageOn(birthDate: string, now: Date): number {
  const [year, month, day] = birthDate.slice(0, 10).split("-").map(Number);
  let age = now.getFullYear() - year;
  const beforeBirthday =
    now.getMonth() + 1 < month ||
    (now.getMonth() + 1 === month && now.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

// 18+ may take either path; 17-year-olds only as verified admitted students.
export function canProceedWithAge(
  age: number,
  path: VerificationPath,
): boolean {
  if (age >= MIN_AGE) return true;
  return age === MIN_AGE - 1 && path === "admitted";
}

export function isVerificationValid(
  v: Verification | undefined,
  now: Date,
): boolean {
  if (!v || v.status !== "approved" || !v.expiresAt) return false;
  return now < new Date(v.expiresAt);
}

export function badgeFor(v: Verification | undefined, now: Date): Badge {
  if (!v) return "none";
  if (v.status === "pending") return "admitted-pending";
  if (v.status === "rejected") return "rejected";
  if (v.status === "expired" || !isVerificationValid(v, now)) return "expired";
  if (v.type === "admitted") return "admitted";
  if (v.type === "graduate") return "graduate";
  return "student";
}
