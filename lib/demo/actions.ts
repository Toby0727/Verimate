// Sample data — delete when the flows are replaced with real functionality.
// Every action checks the business rules first, then updates the sample world.
import { BOOST_DAYS, VERIFICATION_VALID_MONTHS } from "@/lib/rules/constants";
import { detectFraudSignals } from "@/lib/rules/fraud";
import { canUnlock } from "@/lib/rules/matching";
import { entitlements, foundingEligibility } from "@/lib/rules/membership";
import { missingRequiredFields } from "@/lib/rules/profile";
import {
  canSendRequest,
  effectiveStatus,
  type SendRequestRefusal,
} from "@/lib/rules/requests";
import { missingSubletFields } from "@/lib/rules/sublets";
import { addDays, addMonths, daysBetween } from "@/lib/rules/time";
import type {
  Building,
  Profile,
  Questionnaire,
  Report,
  RequestContext,
  Sublet,
} from "@/lib/rules/types";
import {
  ageOn,
  canProceedWithAge,
  isEmailTaken,
  isSchoolEmail,
  isVerificationValid,
  type VerificationPath,
} from "@/lib/rules/verification";
import {
  accountOf,
  currentAccountId,
  foundingContext,
  membershipOf,
  profileOf,
  verificationOf,
} from "./selectors";
import { getSnapshot, resetWorld, setWorld } from "./store";
import type { ActionResult, DemoWorld, PersonaId } from "./types";

export const SAMPLE_CODE = "123456";
const NEW_USER_ID = "acc-new";
const SEMESTER_END = "2027-05-15T00:00:00.000Z";

const now = () => new Date();
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function me(world: DemoWorld): string | null {
  return currentAccountId(world);
}

function withEmail(world: DemoWorld, toId: string, subject: string): DemoWorld {
  const account = accountOf(world, toId);
  if (!account?.emailNotifications) return world;
  return {
    ...world,
    sentEmails: [
      ...world.sentEmails,
      { to: account.googleEmail, subject, sentAt: now().toISOString() },
    ],
  };
}

function isAdmin(world: DemoWorld): boolean {
  return accountOf(world, me(world))?.role === "admin";
}

const emptyProfile = (accountId: string): Profile => ({
  accountId,
  photo: null,
  displayName: null,
  school: null,
  standing: null,
  gender: null,
  budgetMin: null,
  budgetMax: null,
  moveInFrom: null,
  moveInTo: null,
  housingStatus: null,
  groupHave: null,
  groupNeed: null,
  sleep: null,
  cleanliness: null,
  smoking: null,
  pets: null,
  major: null,
  languages: [],
  bio: null,
  buildingId: null,
  roommateGenderPref: null,
  extraPhotos: [],
  prompts: [],
  questionnaire: null,
  aiMatchConsent: false,
  searchStatus: "active",
  pausedReason: null,
  showInBuilding: false,
  boostedUntil: null,
});

function removeAccountData(world: DemoWorld, id: string): DemoWorld {
  const conversations = world.conversations.filter(
    (c) => !c.participantIds.includes(id),
  );
  const conversationIds = new Set(conversations.map((c) => c.id));
  return {
    ...world,
    profiles: world.profiles.filter((p) => p.accountId !== id),
    verifications: world.verifications.filter((v) => v.accountId !== id),
    sublets: world.sublets.filter((s) => s.authorId !== id),
    messageRequests: world.messageRequests.filter(
      (r) => r.fromId !== id && r.toId !== id,
    ),
    conversations,
    messages: world.messages.filter((m) =>
      conversationIds.has(m.conversationId),
    ),
    blocks: world.blocks.filter(
      (b) => b.blockerId !== id && b.blockedId !== id,
    ),
    matches: world.matches.filter(
      (m) => m.viewerId !== id && m.targetId !== id,
    ),
    unlocks: world.unlocks.filter(
      (u) => u.viewerId !== id && u.targetId !== id,
    ),
    memberships: world.memberships.filter((m) => m.accountId !== id),
    profileViews: world.profileViews.filter(
      (v) => v.viewerId !== id && v.targetId !== id,
    ),
    alerts: world.alerts.filter((a) => a.accountId !== id),
  };
}

function updateAccount(
  world: DemoWorld,
  id: string,
  patch: Partial<DemoWorld["accounts"][number]>,
): DemoWorld {
  return {
    ...world,
    accounts: world.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
}

function upsertProfile(
  world: DemoWorld,
  id: string,
  patch: Partial<Profile>,
): DemoWorld {
  const existing = profileOf(world, id);
  const next = { ...(existing ?? emptyProfile(id)), ...patch };
  return {
    ...world,
    profiles: existing
      ? world.profiles.map((p) => (p.accountId === id ? next : p))
      : [...world.profiles, next],
  };
}

// ---------- Demo framework ----------

export function switchPersona(id: PersonaId) {
  if (id === "new-user") {
    startNewUser();
    return;
  }
  setWorld((w) => ({
    ...w,
    currentPersonaId: id,
    viewAsFree: false,
    returnTo: null,
  }));
}

export function setViewAsFree(value: boolean) {
  setWorld((w) => ({ ...w, viewAsFree: value }));
}

export function setVerifiedCount(value: DemoWorld["verifiedCountOverride"]) {
  setWorld((w) => ({ ...w, verifiedCountOverride: value }));
}

export function resetDemo() {
  resetWorld();
}

export function dismissFoundingInvite() {
  setWorld((w) => {
    const id = me(w);
    return id
      ? { ...w, foundingInviteDismissed: [...w.foundingInviteDismissed, id] }
      : w;
  });
}

export function setReturnTo(path: string | null) {
  setWorld((w) => ({ ...w, returnTo: path }));
}

// ---------- Onboarding ----------

export function startNewUser() {
  setWorld((w) => {
    const cleared = removeAccountData(w, NEW_USER_ID);
    const timestamp = now().toISOString();
    return {
      ...cleared,
      currentPersonaId: "new-user",
      viewAsFree: false,
      accounts: [
        ...cleared.accounts.filter((a) => a.id !== NEW_USER_ID),
        {
          id: NEW_USER_ID,
          displayName: "New user",
          googleEmail: "new.user@gmail.example",
          birthDate: null,
          role: "user",
          status: "active",
          createdAt: timestamp,
          lastActiveAt: timestamp,
          emailNotifications: true,
          onboardingStep: "birthday",
        },
      ],
    };
  });
}

export function submitBirthday(
  birthDate: string,
): ActionResult<"missing" | "too-young"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id || !birthDate) return { ok: false, reason: "missing" };
  if (ageOn(birthDate, now()) < 17) return { ok: false, reason: "too-young" };
  setWorld((world) =>
    updateAccount(world, id, { birthDate, onboardingStep: "path" }),
  );
  return { ok: true };
}

export function choosePath(path: VerificationPath): ActionResult<"age"> {
  const w = getSnapshot();
  const account = accountOf(w, me(w));
  if (!account?.birthDate) return { ok: false, reason: "age" };
  if (!canProceedWithAge(ageOn(account.birthDate, now()), path)) {
    return { ok: false, reason: "age" };
  }
  setWorld((world) =>
    updateAccount(world, account.id, { onboardingStep: "verify" }),
  );
  return { ok: true };
}

export function verifySchoolEmail(
  email: string,
  code: string,
): ActionResult<"not-school" | "taken" | "wrong-code"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id || !isSchoolEmail(email)) return { ok: false, reason: "not-school" };
  if (isEmailTaken(email, w.verifications, id))
    return { ok: false, reason: "taken" };
  if (code.trim() !== SAMPLE_CODE) return { ok: false, reason: "wrong-code" };

  setWorld((world) => {
    const existing = verificationOf(world, id);
    const verifiedAt = now().toISOString();
    const verification = {
      id: existing?.id ?? uid("v"),
      accountId: id,
      type:
        existing?.type === "graduate"
          ? ("graduate" as const)
          : ("student" as const),
      schoolEmail: email.trim().toLowerCase(),
      school: email.toLowerCase().endsWith("esf.edu")
        ? ("ESF" as const)
        : ("SU" as const),
      status: "approved" as const,
      verifiedAt,
      expiresAt: addMonths(verifiedAt, VERIFICATION_VALID_MONTHS),
      documentName: null,
      submittedAt: verifiedAt,
    };
    const account = accountOf(world, id);
    const next = {
      ...world,
      verifications: [
        ...world.verifications.filter((v) => v.accountId !== id),
        verification,
      ],
    };
    return account?.onboardingStep === "done"
      ? next
      : updateAccount(next, id, { onboardingStep: "profile" });
  });
  return { ok: true };
}

export function submitAdmittedDocument(
  fileName: string,
): ActionResult<"missing"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id || !fileName) return { ok: false, reason: "missing" };
  setWorld((world) => {
    const submittedAt = now().toISOString();
    return updateAccount(
      {
        ...world,
        verifications: [
          ...world.verifications.filter((v) => v.accountId !== id),
          {
            id: uid("v"),
            accountId: id,
            type: "admitted",
            schoolEmail: null,
            school: "SU",
            status: "pending",
            verifiedAt: null,
            expiresAt: null,
            documentName: fileName,
            submittedAt,
          },
        ],
      },
      id,
      { onboardingStep: "profile" },
    );
  });
  return { ok: true };
}

export function saveRequiredProfile(
  fields: Partial<Profile>,
): ActionResult<"incomplete"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id) return { ok: false, reason: "incomplete" };
  const merged = { ...(profileOf(w, id) ?? emptyProfile(id)), ...fields };
  if (missingRequiredFields(merged).length > 0) {
    return { ok: false, reason: "incomplete" };
  }
  setWorld((world) =>
    updateAccount(upsertProfile(world, id, fields), id, {
      onboardingStep: "done",
      displayName: merged.displayName ?? "New user",
    }),
  );
  return { ok: true };
}

// ---------- Profile and settings ----------

export function updateProfile(
  fields: Partial<Profile>,
): ActionResult<"incomplete"> {
  return saveRequiredProfile(fields);
}

export function saveQuestionnaire(answers: Questionnaire, consent: boolean) {
  setWorld((w) => {
    const id = me(w);
    return id
      ? upsertProfile(w, id, {
          questionnaire: answers,
          aiMatchConsent: consent,
        })
      : w;
  });
}

export function setSearchStatus(status: Profile["searchStatus"]) {
  setWorld((w) => {
    const id = me(w);
    if (!id) return w;
    const next = upsertProfile(w, id, {
      searchStatus: status,
      pausedReason: status === "paused" ? "manual" : null,
    });
    return status === "active"
      ? updateAccount(next, id, { lastActiveAt: now().toISOString() })
      : next;
  });
}

export function setShowInBuilding(value: boolean) {
  setWorld((w) => {
    const id = me(w);
    return id ? upsertProfile(w, id, { showInBuilding: value }) : w;
  });
}

export function setEmailNotifications(value: boolean) {
  setWorld((w) => {
    const id = me(w);
    return id ? updateAccount(w, id, { emailNotifications: value }) : w;
  });
}

export function deleteAccount() {
  setWorld((w) => {
    const id = me(w);
    if (!id) return w;
    return {
      ...updateAccount(removeAccountData(w, id), id, { status: "deleted" }),
      currentPersonaId: "visitor",
    };
  });
}

// ---------- Requests and chat ----------

export function sendRequest(
  toId: string,
  message: string,
  context: RequestContext,
): ActionResult<SendRequestRefusal | "empty" | "signed-out"> {
  const w = getSnapshot();
  const fromId = me(w);
  if (!fromId) return { ok: false, reason: "signed-out" };
  if (!message.trim()) return { ok: false, reason: "empty" };
  const check = canSendRequest(w, fromId, toId, now());
  if (!check.ok) return check;
  setWorld((world) =>
    withEmail(
      {
        ...world,
        messageRequests: [
          ...world.messageRequests,
          {
            id: uid("r"),
            fromId,
            toId,
            message: message.trim(),
            context,
            status: "pending",
            createdAt: now().toISOString(),
            respondedAt: null,
          },
        ],
      },
      toId,
      "You have a new message request",
    ),
  );
  return { ok: true };
}

function respond(
  requestId: string,
  status: "accepted" | "deleted",
): ActionResult<"invalid"> {
  const w = getSnapshot();
  const id = me(w);
  const request = w.messageRequests.find((r) => r.id === requestId);
  if (!id || !request || request.toId !== id)
    return { ok: false, reason: "invalid" };
  if (effectiveStatus(request, now()) !== "pending")
    return { ok: false, reason: "invalid" };

  setWorld((world) => {
    const respondedAt = now().toISOString();
    let next: DemoWorld = {
      ...world,
      messageRequests: world.messageRequests.map((r) =>
        r.id === requestId ? { ...r, status, respondedAt } : r,
      ),
    };
    if (status === "accepted") {
      const conversationId = `c-${requestId}`;
      next = withEmail(
        {
          ...next,
          conversations: [
            ...next.conversations,
            {
              id: conversationId,
              participantIds: [request.fromId, request.toId],
              requestId,
              createdAt: respondedAt,
            },
          ],
          messages: [
            ...next.messages,
            {
              id: uid("m"),
              conversationId,
              senderId: request.fromId,
              body: request.message,
              sentAt: request.createdAt,
              fraudSignals: detectFraudSignals(request.message),
            },
          ],
        },
        request.fromId,
        "Your message request was accepted",
      );
    }
    return next;
  });
  return { ok: true };
}

export const acceptRequest = (id: string) => respond(id, "accepted");
export const deleteRequest = (id: string) => respond(id, "deleted");

export function block(targetId: string) {
  setWorld((w) => {
    const id = me(w);
    if (!id || id === targetId) return w;
    if (w.blocks.some((b) => b.blockerId === id && b.blockedId === targetId))
      return w;
    return {
      ...w,
      blocks: [
        ...w.blocks,
        { blockerId: id, blockedId: targetId, createdAt: now().toISOString() },
      ],
    };
  });
}

export function blockFromRequest(requestId: string): ActionResult<"invalid"> {
  const request = getSnapshot().messageRequests.find((r) => r.id === requestId);
  if (!request) return { ok: false, reason: "invalid" };
  const result = deleteRequest(requestId);
  block(request.fromId);
  return result.ok ? result : { ok: true };
}

export function sendMessage(
  conversationId: string,
  body: string,
): ActionResult<"invalid"> {
  const w = getSnapshot();
  const id = me(w);
  const conversation = w.conversations.find((c) => c.id === conversationId);
  if (!id || !conversation?.participantIds.includes(id) || !body.trim()) {
    return { ok: false, reason: "invalid" };
  }
  setWorld((world) => ({
    ...world,
    messages: [
      ...world.messages,
      {
        id: uid("m"),
        conversationId,
        senderId: id,
        body: body.trim(),
        sentAt: now().toISOString(),
        fraudSignals: detectFraudSignals(body),
      },
    ],
  }));
  return { ok: true };
}

// ---------- Sublets ----------

export function createSublet(
  fields: Partial<Sublet>,
): ActionResult<"unverified" | "incomplete"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id || !isVerificationValid(verificationOf(w, id), now())) {
    return { ok: false, reason: "unverified" };
  }
  if (missingSubletFields(fields).length > 0)
    return { ok: false, reason: "incomplete" };
  const timestamp = now().toISOString();
  const documentName = fields.lease?.documentName ?? null;
  setWorld((world) => ({
    ...world,
    sublets: [
      {
        title: fields.title?.trim() || "Sublet",
        area: null,
        buildingId: null,
        rent: null,
        startDate: null,
        endDate: null,
        roomType: null,
        furnished: null,
        photos: [],
        roommatesInfo: null,
        onLeaseDeclared: false,
        exactAddress: null,
        description: null,
        ...fields,
        id: uid("s"),
        authorId: id,
        lease: { documentName, status: documentName ? "pending" : "none" },
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
        staleNotifiedAt: null,
      },
      ...world.sublets,
    ],
  }));
  return { ok: true };
}

function updateOwnSublet(subletId: string, patch: Partial<Sublet>) {
  setWorld((w) => {
    const id = me(w);
    return {
      ...w,
      sublets: w.sublets.map((s) =>
        s.id === subletId && s.authorId === id ? { ...s, ...patch } : s,
      ),
    };
  });
}

export const markSubleased = (subletId: string) =>
  updateOwnSublet(subletId, { status: "subleased" });

export const confirmStillAvailable = (subletId: string) =>
  updateOwnSublet(subletId, {
    status: "active",
    updatedAt: now().toISOString(),
    staleNotifiedAt: null,
  });

// ---------- For You and membership ----------

export function unlockMatch(targetId: string) {
  const w = getSnapshot();
  const id = me(w);
  if (!id) return { ok: false as const, reason: "no-consent" as const };
  const check = canUnlock(w, id, targetId, now());
  if (!check.ok) return check;
  setWorld((world) => ({
    ...world,
    unlocks: [
      ...world.unlocks,
      { viewerId: id, targetId, unlockedAt: now().toISOString() },
    ],
  }));
  return { ok: true as const };
}

export function claimFounding() {
  const w = getSnapshot();
  const id = me(w);
  if (!id) return { eligible: false, missing: ["verified" as const] };
  const result = foundingEligibility(w, id, now(), foundingContext(w));
  if (!result.eligible) return result;
  setWorld((world) => ({
    ...world,
    memberships: [
      ...world.memberships.filter((m) => m.accountId !== id),
      {
        accountId: id,
        kind: "founding",
        startedAt: now().toISOString(),
        endsAt: SEMESTER_END,
        lifetimeDiscount: "50% off the season pass",
      },
    ],
  }));
  return result;
}

// Paid plans are not sold in the demo; the UI shows a sample notice instead.
export function choosePlan(): ActionResult<"sample"> {
  return { ok: false, reason: "sample" };
}

export function boostProfile(): ActionResult<"not-member"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id || !entitlements(membershipOf(w, id), w.viewAsFree).has("boost")) {
    return { ok: false, reason: "not-member" };
  }
  setWorld((world) =>
    upsertProfile(world, id, { boostedUntil: addDays(now(), BOOST_DAYS) }),
  );
  return { ok: true };
}

export function recordProfileView(targetId: string) {
  const w = getSnapshot();
  const id = me(w);
  if (!id || id === targetId) return;
  const recent = w.profileViews.some(
    (v) =>
      v.viewerId === id &&
      v.targetId === targetId &&
      daysBetween(v.viewedAt, now()) < 1,
  );
  if (recent) return;
  setWorld((world) => ({
    ...world,
    profileViews: [
      ...world.profileViews,
      { viewerId: id, targetId, viewedAt: now().toISOString() },
    ],
  }));
}

// ---------- Reports and admin ----------

export function report(
  target: Report["target"],
  reason: string,
  note: string,
): ActionResult<"signed-out"> {
  const w = getSnapshot();
  const id = me(w);
  if (!id) return { ok: false, reason: "signed-out" };
  setWorld((world) => ({
    ...world,
    reports: [
      ...world.reports,
      {
        id: uid("rep"),
        reporterId: id,
        target,
        reason,
        note: note.trim() || null,
        status: "open",
        resolution: null,
        createdAt: now().toISOString(),
        resolvedAt: null,
      },
    ],
  }));
  return { ok: true };
}

export function reviewVerification(
  verificationId: string,
  decision: "approved" | "rejected",
): ActionResult<"not-admin"> {
  if (!isAdmin(getSnapshot())) return { ok: false, reason: "not-admin" };
  setWorld((w) => ({
    ...w,
    verifications: w.verifications.map((v) => {
      if (v.id !== verificationId) return v;
      const verifiedAt = now().toISOString();
      return decision === "approved"
        ? {
            ...v,
            status: "approved",
            verifiedAt,
            expiresAt: addMonths(verifiedAt, VERIFICATION_VALID_MONTHS),
            documentName: null,
          }
        : { ...v, status: "rejected", documentName: null };
    }),
  }));
  return { ok: true };
}

export function reviewLease(
  subletId: string,
  decision: "verified" | "rejected",
): ActionResult<"not-admin"> {
  if (!isAdmin(getSnapshot())) return { ok: false, reason: "not-admin" };
  setWorld((w) => ({
    ...w,
    sublets: w.sublets.map((s) =>
      s.id === subletId
        ? { ...s, lease: { documentName: null, status: decision } }
        : s,
    ),
  }));
  return { ok: true };
}

export function resolveReport(
  reportId: string,
  resolution: NonNullable<Report["resolution"]>,
): ActionResult<"not-admin"> {
  const w = getSnapshot();
  if (!isAdmin(w)) return { ok: false, reason: "not-admin" };
  const target = w.reports.find((r) => r.id === reportId)?.target;
  setWorld((world) => {
    let next: DemoWorld = {
      ...world,
      reports: world.reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "resolved",
              resolution,
              resolvedAt: now().toISOString(),
            }
          : r,
      ),
    };
    if (target && resolution === "removed" && target.type === "sublet") {
      next = {
        ...next,
        sublets: next.sublets.map((s) =>
          s.id === target.id ? { ...s, status: "removed" } : s,
        ),
      };
    }
    if (target && resolution === "banned") {
      const accountId =
        target.type === "account"
          ? target.id
          : next.sublets.find((s) => s.id === target.id)?.authorId;
      if (accountId)
        next = updateAccount(next, accountId, { status: "banned" });
    }
    return next;
  });
  return { ok: true };
}

export function addBuilding(
  name: string,
  kind: Building["kind"],
): ActionResult<"not-admin" | "missing"> {
  if (!isAdmin(getSnapshot())) return { ok: false, reason: "not-admin" };
  if (!name.trim()) return { ok: false, reason: "missing" };
  setWorld((w) => ({
    ...w,
    buildings: [
      ...w.buildings,
      { id: uid("b"), name: name.trim(), kind, city: "syracuse", active: true },
    ],
  }));
  return { ok: true };
}

export function toggleBuilding(buildingId: string) {
  if (!isAdmin(getSnapshot())) return;
  setWorld((w) => ({
    ...w,
    buildings: w.buildings.map((b) =>
      b.id === buildingId ? { ...b, active: !b.active } : b,
    ),
  }));
}
