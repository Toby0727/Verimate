// Which flows are sample-only and which are live. Flip an entry to "live"
// when that flow is replaced with real functionality.
export type FlowStatus = {
  name: string;
  status: "sample" | "live";
  note: string;
};

export const FLOW_STATUS: FlowStatus[] = [
  {
    name: "Sign in with Google",
    status: "live",
    note: "Uses your real Google account. Your name and email carry into onboarding; everything after that is still sample.",
  },
  {
    name: "Sign in with phone or email",
    status: "sample",
    note: "Hidden for now. Only Google sign-in is offered.",
  },
  {
    name: "Verification with a school Google account",
    status: "live",
    note: "Signing in with an SU or ESF Google account verifies you as a student, so you skip the email code. Saved only in this browser.",
  },
  {
    name: "School email verification",
    status: "sample",
    note: "No email is sent. The sample code is always 123456.",
  },
  {
    name: "Profile",
    status: "sample",
    note: "Saved only in this browser.",
  },
  {
    name: "Roommate list and filters",
    status: "sample",
    note: "Sample students only.",
  },
  {
    name: "Message requests and chat",
    status: "sample",
    note: "Messages stay in this browser; email alerts are not sent.",
  },
  {
    name: "Sublets",
    status: "sample",
    note: "Photos come from a sample gallery; files are not uploaded.",
  },
  {
    name: "For You",
    status: "sample",
    note: "Match scores and reasons are pre-written, not computed by AI.",
  },
  {
    name: "Same building",
    status: "sample",
    note: "Placeholder list of Syracuse buildings and areas.",
  },
  {
    name: "Membership and founding members",
    status: "sample",
    note: "No payment is taken. The 50-user threshold is a demo switch.",
  },
  {
    name: "Me and settings",
    status: "sample",
    note: "Deleting an account removes it from this browser only.",
  },
  {
    name: "Team admin",
    status: "sample",
    note: "Access is based on the sample persona, not real permissions.",
  },
];
