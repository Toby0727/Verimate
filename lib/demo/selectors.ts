// Sample data — delete when the flows are replaced with real functionality.
// Lookups over the sample world. Business rules live in lib/rules.
import { FOUNDING_THRESHOLD_VERIFIED } from "@/lib/rules/constants";
import type { FoundingContext } from "@/lib/rules/membership";
import { isListed } from "@/lib/rules/profile";
import { isHiddenFor } from "@/lib/rules/visibility";
import { personaById } from "./personas";
import type { DemoWorld } from "./types";

export const accountOf = (world: DemoWorld, id: string | null) =>
  id ? world.accounts.find((a) => a.id === id) : undefined;

export const profileOf = (world: DemoWorld, id: string | null) =>
  id ? world.profiles.find((p) => p.accountId === id) : undefined;

export const verificationOf = (world: DemoWorld, id: string | null) =>
  id ? world.verifications.find((v) => v.accountId === id) : undefined;

export const membershipOf = (world: DemoWorld, id: string | null) =>
  id ? world.memberships.find((m) => m.accountId === id) : undefined;

export const buildingOf = (world: DemoWorld, id: string | null) =>
  id ? world.buildings.find((b) => b.id === id) : undefined;

export const subletOf = (world: DemoWorld, id: string) =>
  world.sublets.find((s) => s.id === id);

// The signed-in account, or null for visitors and deleted accounts.
export function currentAccountId(world: DemoWorld): string | null {
  const id = personaById(world.currentPersonaId).accountId;
  const account = accountOf(world, id);
  return account && account.status !== "deleted" ? account.id : null;
}

// The sample verified-user count shown in the membership flow.
export function verifiedCount(world: DemoWorld): number {
  return world.verifiedCountOverride === "reached50"
    ? FOUNDING_THRESHOLD_VERIFIED + 2
    : FOUNDING_THRESHOLD_VERIFIED - 12;
}

export function foundingContext(world: DemoWorld): FoundingContext {
  return {
    thresholdReached: world.verifiedCountOverride === "reached50",
    seatsTakenElsewhere: world.foundingSeatsTakenElsewhere,
  };
}

export function isAccountListed(world: DemoWorld, id: string, now: Date) {
  return isListed(
    accountOf(world, id),
    profileOf(world, id),
    verificationOf(world, id),
    now,
  );
}

// Profiles in the roommate list for this viewer, boosted profiles first.
export function listedProfiles(
  world: DemoWorld,
  viewerId: string | null,
  now: Date,
) {
  return world.profiles
    .filter(
      (p) =>
        isAccountListed(world, p.accountId, now) &&
        !isHiddenFor(viewerId, p.accountId, world.blocks),
    )
    .sort((a, b) => {
      const boosted = (id: string | null) =>
        id !== null && new Date(id) > now ? 1 : 0;
      return boosted(b.boostedUntil) - boosted(a.boostedUntil);
    });
}

export function conversationOf(world: DemoWorld, id: string) {
  return world.conversations.find((c) => c.id === id);
}

export function otherParticipant(
  participantIds: [string, string],
  meId: string,
): string {
  return participantIds[0] === meId ? participantIds[1] : participantIds[0];
}
