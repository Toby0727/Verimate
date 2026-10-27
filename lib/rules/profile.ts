import { INACTIVE_AUTO_PAUSE_DAYS, MAX_PROFILE_PHOTOS } from "./constants";
import { daysBetween } from "./time";
import type { Account, Profile, Verification } from "./types";
import { isVerificationValid } from "./verification";

const REQUIRED_FIELDS = [
  "photo",
  "displayName",
  "school",
  "standing",
  "gender",
  "budgetMin",
  "budgetMax",
  "moveInFrom",
  "moveInTo",
  "housingStatus",
  "sleep",
  "cleanliness",
  "smoking",
  "pets",
] as const;

export type RequiredField =
  | (typeof REQUIRED_FIELDS)[number]
  | "groupHave"
  | "groupNeed";

export function missingRequiredFields(
  profile: Partial<Profile>,
): RequiredField[] {
  const missing: RequiredField[] = REQUIRED_FIELDS.filter((field) => {
    const value = profile[field];
    return value === null || value === undefined || value === "";
  });
  if (profile.housingStatus === "group") {
    if (!profile.groupHave) missing.push("groupHave");
    if (!profile.groupNeed) missing.push("groupNeed");
  }
  return missing;
}

export function isProfileComplete(profile: Partial<Profile>): boolean {
  return missingRequiredFields(profile).length === 0;
}

// The required photo first, then the optional ones, up to the limit.
export function profilePhotos(profile: Profile): string[] {
  return [profile.photo, ...profile.extraPhotos]
    .filter((p): p is string => Boolean(p))
    .slice(0, MAX_PROFILE_PHOTOS);
}

export function shouldAutoPause(account: Account, now: Date): boolean {
  return daysBetween(account.lastActiveAt, now) >= INACTIVE_AUTO_PAUSE_DAYS;
}

// Whether someone appears in the roommate list, For You and the building list.
export function isListed(
  account: Account | undefined,
  profile: Profile | undefined,
  verification: Verification | undefined,
  now: Date,
): boolean {
  if (!account || !profile) return false;
  return (
    account.status === "active" &&
    profile.searchStatus === "active" &&
    !shouldAutoPause(account, now) &&
    isProfileComplete(profile) &&
    isVerificationValid(verification, now)
  );
}
