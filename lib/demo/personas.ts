// Sample data — delete when the flows are replaced with real functionality.
import type { Persona, PersonaId } from "./types";

export const PERSONAS: Persona[] = [
  {
    id: "visitor",
    label: "Visitor",
    description: "Not signed in. Sees blurred previews only.",
    accountId: null,
  },
  {
    id: "new-user",
    label: "New user",
    description: "Just signed in with Google. Starts onboarding from scratch.",
    accountId: "acc-new",
  },
  {
    id: "student-free",
    label: "Jamie · free student",
    description:
      "Verified SU junior on the free plan, with requests and a chat.",
    accountId: "me-jamie",
  },
  {
    id: "admitted-pending",
    label: "Leo · admitted, under review",
    description: "Uploaded an admission letter, waiting for the team.",
    accountId: "me-leo",
  },
  {
    id: "admitted-17",
    label: "Ana · 17, admitted",
    description: "Verified incoming student under 18. Sees extra safety tips.",
    accountId: "me-ana",
  },
  {
    id: "member-internal",
    label: "Toby · internal member",
    description: "Founder account with every member feature.",
    accountId: "me-internal",
  },
  {
    id: "admin",
    label: "Team admin",
    description: "Reviews documents and reports in the admin area.",
    accountId: "me-admin",
  },
  {
    id: "expired",
    label: "Chris · verification expired",
    description: "Needs to verify the school email again.",
    accountId: "me-chris",
  },
  {
    id: "banned",
    label: "Sam · banned",
    description: "Account removed by the team.",
    accountId: "me-sam",
  },
];

export function personaById(id: PersonaId): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
