import type { Metadata } from "next";
import { TeamDashboard } from "@/components/team/team-dashboard";

export const metadata: Metadata = {
  title: "Verimate · Team",
  robots: { index: false, follow: false },
};

// Private team dashboard. The page is a static shell; data only loads for
// accounts on the team list (checked by public.team_waitlist()).
export default function TeamPage() {
  return <TeamDashboard />;
}
