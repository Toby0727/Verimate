// Domain types shared by the business rules. Field names and enum values follow
// specs/001-clickable-flow-demo/data-model.md. All timestamps are ISO strings.

export type School = "SU" | "ESF";

export type Account = {
  id: string;
  displayName: string;
  googleEmail: string;
  birthDate: string | null;
  role: "user" | "internal" | "admin";
  status: "active" | "banned" | "deleted";
  createdAt: string;
  lastActiveAt: string;
  emailNotifications: boolean;
  onboardingStep: "birthday" | "path" | "verify" | "profile" | "done";
};

export type Verification = {
  id: string;
  accountId: string;
  type: "student" | "admitted" | "graduate";
  schoolEmail: string | null;
  school: School;
  status: "pending" | "approved" | "rejected" | "expired";
  verifiedAt: string | null;
  expiresAt: string | null;
  documentName: string | null;
  submittedAt: string;
};

export type Gender = "woman" | "man" | "nonbinary";
export type HousingStatus = "has-place" | "needs-place" | "group";
export type Sleep = "early" | "flexible" | "late";
export type Cleanliness = "very-tidy" | "tidy" | "relaxed";
export type Smoking = "no" | "outside" | "yes";
export type Pets = "none" | "ok" | "has-pet";

export type Questionnaire = {
  guests: "rarely" | "sometimes" | "often";
  noise: "quiet" | "moderate" | "lively";
  cooking: "rarely" | "sometimes" | "daily";
  study: "home" | "library" | "mixed";
  sharing: "keep-separate" | "share-basics" | "share-everything";
};

export type PromptAnswer = { promptId: string; answer: string };

export type Profile = {
  accountId: string;
  // Required
  photo: string | null;
  displayName: string | null;
  school: School | null;
  standing: string | null;
  gender: Gender | null;
  budgetMin: number | null;
  budgetMax: number | null;
  moveInFrom: string | null;
  moveInTo: string | null;
  housingStatus: HousingStatus | null;
  groupHave: number | null;
  groupNeed: number | null;
  sleep: Sleep | null;
  cleanliness: Cleanliness | null;
  smoking: Smoking | null;
  pets: Pets | null;
  // Optional
  major: string | null;
  languages: string[];
  bio: string | null;
  buildingId: string | null;
  roommateGenderPref: "same" | "any" | null;
  extraPhotos: string[];
  prompts: PromptAnswer[];
  // Detailed questionnaire
  questionnaire: Questionnaire | null;
  aiMatchConsent: boolean;
  // State
  searchStatus: "active" | "paused";
  pausedReason: "manual" | "inactive" | null;
  showInBuilding: boolean;
  boostedUntil: string | null;
};

// What a profile request replies to, if anything.
export type RequestQuote =
  | { kind: "photo"; photo: string }
  | ({ kind: "prompt" } & PromptAnswer);

export type RequestContext =
  | { type: "profile"; quote?: RequestQuote }
  | { type: "sublet"; subletId: string };

export type MessageRequest = {
  id: string;
  fromId: string;
  toId: string;
  message: string;
  context: RequestContext;
  status: "pending" | "accepted" | "deleted" | "expired";
  createdAt: string;
  respondedAt: string | null;
};

export type FraudSignal = "phone" | "external-handle" | "payment";

export type Conversation = {
  id: string;
  participantIds: [string, string];
  requestId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
  fraudSignals: FraudSignal[];
};

export type Block = { blockerId: string; blockedId: string; createdAt: string };

export type RoomType = "private" | "entire" | "shared";

export type Sublet = {
  id: string;
  authorId: string;
  title: string;
  area: string | null;
  buildingId: string | null;
  rent: number | null;
  startDate: string | null;
  endDate: string | null;
  roomType: RoomType | null;
  furnished: boolean | null;
  photos: string[];
  roommatesInfo: string | null;
  onLeaseDeclared: boolean;
  exactAddress: string | null;
  description: string | null;
  lease: {
    documentName: string | null;
    status: "none" | "pending" | "verified" | "rejected";
  };
  status: "active" | "stale" | "subleased" | "expired" | "removed";
  createdAt: string;
  updatedAt: string;
  staleNotifiedAt: string | null;
};

export type Building = {
  id: string;
  name: string;
  kind: "building" | "area";
  city: "syracuse";
  active: boolean;
};

export type Match = {
  viewerId: string;
  targetId: string;
  score: number;
  oneLiner: string;
  reasons: string[];
};

export type Unlock = { viewerId: string; targetId: string; unlockedAt: string };

export type MembershipKind =
  | "free"
  | "founding"
  | "monthly"
  | "season"
  | "internal";

export type Membership = {
  accountId: string;
  kind: MembershipKind;
  startedAt: string;
  endsAt: string | null;
  lifetimeDiscount: string | null;
};

export type Report = {
  id: string;
  reporterId: string;
  target: { type: "account" | "sublet"; id: string };
  reason: string;
  note: string | null;
  status: "open" | "resolved";
  resolution: "removed" | "warned" | "banned" | "dismissed" | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type ProfileView = {
  viewerId: string;
  targetId: string;
  viewedAt: string;
};

// The collections the rules read. The demo world (lib/demo) is a superset of this.
export type Dataset = {
  accounts: Account[];
  verifications: Verification[];
  profiles: Profile[];
  messageRequests: MessageRequest[];
  conversations: Conversation[];
  messages: Message[];
  blocks: Block[];
  sublets: Sublet[];
  buildings: Building[];
  matches: Match[];
  unlocks: Unlock[];
  memberships: Membership[];
  reports: Report[];
  profileViews: ProfileView[];
};
