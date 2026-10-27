// Sample data — delete when the flows are replaced with real functionality.
import type { Dataset } from "@/lib/rules/types";

export type PersonaId =
  | "visitor"
  | "new-user"
  | "student-free"
  | "admitted-pending"
  | "admitted-17"
  | "member-internal"
  | "admin"
  | "expired"
  | "banned";

export type Persona = {
  id: PersonaId;
  label: string;
  description: string;
  accountId: string | null;
};

export type SampleEmail = { to: string; subject: string; sentAt: string };

export type Alert = {
  id: string;
  accountId: string;
  text: string;
  href: string;
  createdAt: string;
};

export type DemoWorld = Dataset & {
  version: number;
  seededAt: string;
  currentPersonaId: PersonaId;
  viewAsFree: boolean;
  verifiedCountOverride: "below50" | "reached50";
  // Founding seats taken by people outside the sample set.
  foundingSeatsTakenElsewhere: number;
  foundingInviteDismissed: string[];
  sentEmails: SampleEmail[];
  alerts: Alert[];
  // Persona whose onboarding/verification flow should return here when done.
  returnTo: string | null;
};

export type ActionResult<R extends string = string> =
  | { ok: true }
  | { ok: false; reason: R };
