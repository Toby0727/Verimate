import type { Entitlement, FoundingGap } from "@/lib/rules/membership";

export const PERK_LABELS: Record<Entitlement, { title: string; body: string }> =
  {
    aiFull: {
      title: "Full AI matching",
      body: "See every match, your top matches and the full reasons.",
    },
    alerts: {
      title: "New match alerts",
      body: "Get an email when a matching roommate or sublet appears.",
    },
    boost: {
      title: "Profile boost",
      body: "Show up first in the roommate list for 7 days.",
    },
    whoViewed: {
      title: "Who viewed me",
      body: "See who looked at your profile.",
    },
  };

export const GAP_LABELS: Record<FoundingGap, string> = {
  threshold: "Founding spots open once Verimate has 50 verified students",
  "already-member": "You're already a member",
  verified: "Verify your school email or admission",
  profile: "Fill in every required profile field",
  questionnaire: "Complete the detailed questionnaire",
  "account-age": "Have your account for at least 7 days",
  reports: "No upheld reports on your account",
  seats: "All 30 founding spots are taken",
};
