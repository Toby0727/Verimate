import { isListed } from "./profile";
import type { Block, Conversation, Dataset, Profile, Sublet } from "./types";
import { isVerificationValid } from "./verification";

// Blocks hide both people from each other, whoever blocked whom.
export function isHiddenFor(
  viewerId: string | null,
  targetId: string,
  blocks: Block[],
): boolean {
  if (!viewerId) return false;
  return blocks.some(
    (b) =>
      (b.blockerId === viewerId && b.blockedId === targetId) ||
      (b.blockerId === targetId && b.blockedId === viewerId),
  );
}

// Visitors (not signed in) see blurred photos, initials only and no contact.
export function isBlurredForVisitor(viewerAccountId: string | null): boolean {
  return viewerAccountId === null;
}

export function isConnected(
  a: string,
  b: string,
  conversations: Conversation[],
): boolean {
  return conversations.some(
    (c) => c.participantIds.includes(a) && c.participantIds.includes(b),
  );
}

export function canSeeExactAddress(
  viewerId: string | null,
  sublet: Sublet,
  conversations: Conversation[],
): boolean {
  if (!viewerId) return false;
  return (
    viewerId === sublet.authorId ||
    isConnected(viewerId, sublet.authorId, conversations)
  );
}

// People who opted in to the building list. Only verified viewers see anyone.
export function buildingMembers(
  data: Dataset,
  buildingId: string,
  viewerId: string,
  now: Date,
): Profile[] {
  const viewerVerification = data.verifications.find(
    (v) => v.accountId === viewerId,
  );
  if (!isVerificationValid(viewerVerification, now)) return [];
  return data.profiles.filter(
    (p) =>
      p.buildingId === buildingId &&
      p.showInBuilding &&
      !isHiddenFor(viewerId, p.accountId, data.blocks) &&
      isListed(
        data.accounts.find((a) => a.id === p.accountId),
        p,
        data.verifications.find((v) => v.accountId === p.accountId),
        now,
      ),
  );
}
