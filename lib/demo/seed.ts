// Sample data — delete when the flows are replaced with real functionality.
// Every timestamp is relative to `now`, so the sample world always looks fresh.
import { addDays, addMonths } from "@/lib/rules/time";
import type {
  Account,
  Building,
  Match,
  Membership,
  Profile,
  PromptAnswer,
  Questionnaire,
  Sublet,
  Verification,
} from "@/lib/rules/types";
import type { DemoWorld } from "./types";

export const DEMO_VERSION = 2;

const person = (file: string) => `/sample/people/${file}`;
const room = (file: string) => `/sample/rooms/${file}`;

type UserSeed = {
  id: string;
  name: string;
  photo: string;
  school?: "SU" | "ESF";
  standing: string;
  gender: Profile["gender"];
  budget: [number, number];
  moveIn: [string, string];
  housing: Profile["housingStatus"];
  group?: [number, number];
  habits: [
    Profile["sleep"],
    Profile["cleanliness"],
    Profile["smoking"],
    Profile["pets"],
  ];
  major?: string;
  languages?: string[];
  bio?: string;
  extraPhotos?: string[];
  prompts?: PromptAnswer[];
  buildingId?: string;
  showInBuilding?: boolean;
  consent?: boolean;
  questionnaire?: Questionnaire;
  createdDaysAgo: number;
  activeDaysAgo?: number;
  paused?: boolean;
  verification?:
    | "student"
    | "graduate"
    | "admitted"
    | "admitted-pending"
    | "expired";
  incomplete?: boolean;
};

const Q_CALM: Questionnaire = {
  guests: "rarely",
  noise: "quiet",
  cooking: "daily",
  study: "home",
  sharing: "share-basics",
};
const Q_SOCIAL: Questionnaire = {
  guests: "often",
  noise: "lively",
  cooking: "sometimes",
  study: "library",
  sharing: "share-everything",
};
const Q_MIXED: Questionnaire = {
  guests: "sometimes",
  noise: "moderate",
  cooking: "sometimes",
  study: "mixed",
  sharing: "keep-separate",
};

const FALL = ["2027-08-15", "2028-05-15"] as [string, string];
const SUMMER = ["2027-05-20", "2027-08-10"] as [string, string];
const SPRING = ["2027-01-10", "2027-05-20"] as [string, string];

const USERS: UserSeed[] = [
  // Persona accounts
  {
    id: "me-jamie",
    name: "Jamie P.",
    photo: person("u-mia.jpg"),
    standing: "Junior",
    gender: "woman",
    budget: [700, 950],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["early", "tidy", "no", "none"],
    major: "Information Management",
    languages: ["English", "Korean"],
    bio: "Early riser, cooks a lot, looking for a calm place near campus for next year.",
    buildingId: "b-park-point",
    showInBuilding: true,
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 40,
    extraPhotos: [room("r-1567767292.jpg"), room("u-kitchen.jpg")],
    prompts: [
      {
        promptId: "ideal-sunday",
        answer:
          "Farmers market at 9, then cooking way too much soup for everyone.",
      },
      {
        promptId: "quiet-hours",
        answer: "Lights out by 11 on weeknights. Weekends are fair game.",
      },
    ],
  },
  {
    id: "me-leo",
    name: "Leo W.",
    photo: person("p-1506794778.jpg"),
    standing: "Admitted · Fall 2027",
    gender: "man",
    budget: [800, 1100],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["flexible", "tidy", "no", "ok"],
    createdDaysAgo: 3,
    verification: "admitted-pending",
  },
  {
    id: "me-ana",
    name: "Ana R.",
    photo: person("p-1544005313.jpg"),
    standing: "Admitted · Spring 2027",
    gender: "woman",
    budget: [650, 850],
    moveIn: SPRING,
    housing: "needs-place",
    habits: ["early", "very-tidy", "no", "none"],
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 12,
    verification: "admitted",
  },
  {
    id: "me-internal",
    name: "Toby C.",
    photo: person("p-1500648767.jpg"),
    standing: "Senior",
    gender: "man",
    budget: [750, 1000],
    moveIn: SUMMER,
    housing: "has-place",
    habits: ["late", "tidy", "no", "ok"],
    major: "Computer Science",
    consent: true,
    questionnaire: Q_MIXED,
    createdDaysAgo: 90,
    extraPhotos: [room("r-1513694203.jpg")],
    prompts: [
      {
        promptId: "good-roommate",
        answer: "I always replace the last roll of paper towels.",
      },
    ],
  },
  {
    id: "me-chris",
    name: "Chris L.",
    photo: person("p-1534528741.jpg"),
    standing: "Graduate",
    gender: "man",
    budget: [700, 900],
    moveIn: SUMMER,
    housing: "has-place",
    habits: ["flexible", "relaxed", "no", "none"],
    createdDaysAgo: 400,
    verification: "expired",
  },
  {
    id: "me-sam",
    name: "Sam B.",
    photo: person("p-1539571696.jpg"),
    standing: "Sophomore",
    gender: "man",
    budget: [500, 700],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["late", "relaxed", "yes", "none"],
    createdDaysAgo: 20,
  },
  // Other sample students
  {
    id: "u01",
    name: "Chloe M.",
    photo: person("u-chloe.jpg"),
    standing: "Junior",
    gender: "woman",
    budget: [750, 950],
    moveIn: FALL,
    housing: "has-place",
    habits: ["early", "very-tidy", "no", "none"],
    major: "Public Relations",
    bio: "Have a 3-bed on University Hill, looking for one more tidy roommate.",
    buildingId: "a-university-hill",
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 60,
    extraPhotos: [
      room("u-room-real.jpg"),
      room("u-living.jpg"),
      room("u-kitchen.jpg"),
    ],
    prompts: [
      {
        promptId: "dealbreaker",
        answer: "Dishes left in the sink overnight.",
      },
      {
        promptId: "ideal-sunday",
        answer: "Long run, big brunch, then studio work in the afternoon.",
      },
      {
        promptId: "share",
        answer: "Kitchen basics, Netflix, my very good speaker.",
      },
    ],
  },
  {
    id: "u02",
    name: "Ethan W.",
    photo: person("u-ethan.jpg"),
    standing: "Senior",
    gender: "man",
    budget: [650, 850],
    moveIn: FALL,
    housing: "group",
    group: [2, 1],
    habits: ["late", "tidy", "outside", "ok"],
    major: "Finance",
    bio: "Two of us looking for a third for next year. Founding member!",
    buildingId: "b-park-point",
    showInBuilding: true,
    consent: true,
    questionnaire: Q_SOCIAL,
    createdDaysAgo: 75,
    extraPhotos: [room("r-1493809842.jpg")],
    prompts: [
      {
        promptId: "guests",
        answer: "Most weekends, but we always text the group first.",
      },
    ],
  },
  {
    id: "u03",
    name: "Jason L.",
    photo: person("u-jason.jpg"),
    standing: "Graduate",
    gender: "man",
    budget: [800, 1100],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["early", "tidy", "no", "none"],
    major: "Engineering Management",
    languages: ["English", "Mandarin"],
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 30,
    prompts: [
      {
        promptId: "kitchen",
        answer: "Makes dumplings from scratch and shares them.",
      },
    ],
  },
  {
    id: "u04",
    name: "Kevin Z.",
    photo: person("u-kevin.jpg"),
    standing: "Sophomore",
    gender: "man",
    budget: [600, 800],
    moveIn: SUMMER,
    housing: "needs-place",
    habits: ["late", "relaxed", "no", "has-pet"],
    bio: "Summer internship in Syracuse, need a place May–Aug. I have a cat.",
    consent: true,
    questionnaire: Q_SOCIAL,
    createdDaysAgo: 18,
    extraPhotos: [room("r-1502005229.jpg")],
    prompts: [
      {
        promptId: "dealbreaker",
        answer: "Anyone who doesn't like cats. Sorry.",
      },
    ],
  },
  {
    id: "u05",
    name: "Layla H.",
    photo: person("u-layla.jpg"),
    standing: "Junior",
    gender: "woman",
    budget: [700, 900],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["early", "tidy", "no", "none"],
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 50,
    paused: true,
  },
  {
    id: "u06",
    name: "Priya N.",
    photo: person("u-priya.jpg"),
    standing: "Graduate",
    gender: "woman",
    budget: [800, 1000],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["flexible", "tidy", "no", "ok"],
    consent: true,
    createdDaysAgo: 80,
    activeDaysAgo: 41,
    prompts: [
      {
        promptId: "quiet-hours",
        answer: "Up at 6 for runs, so I'm quiet by 10.",
      },
    ],
  },
  {
    id: "u07",
    name: "Ava T.",
    photo: person("p-1494790108.jpg"),
    standing: "Freshman",
    gender: "woman",
    budget: [600, 800],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["late", "tidy", "no", "none"],
    createdDaysAgo: 2,
    incomplete: true,
  },
  {
    id: "u08",
    name: "Noah G.",
    photo: person("p-1463453091.jpg"),
    school: "ESF",
    standing: "Graduate (May 2027)",
    gender: "man",
    budget: [700, 900],
    moveIn: SUMMER,
    housing: "has-place",
    habits: ["early", "tidy", "no", "ok"],
    major: "Environmental Science",
    bio: "Graduating in May, subletting my room for the summer.",
    consent: true,
    questionnaire: Q_MIXED,
    createdDaysAgo: 200,
    verification: "graduate",
  },
  {
    id: "u09",
    name: "Sofia R.",
    photo: person("p-1517841905.jpg"),
    standing: "Junior",
    gender: "woman",
    budget: [700, 950],
    moveIn: FALL,
    housing: "group",
    group: [1, 2],
    habits: ["early", "tidy", "no", "none"],
    consent: true,
    questionnaire: Q_CALM,
    buildingId: "b-park-point",
    showInBuilding: true,
    createdDaysAgo: 45,
    extraPhotos: [room("r-1522708323.jpg"), room("u-room-sofa.jpg")],
    prompts: [
      {
        promptId: "good-roommate",
        answer: "I'm the one who actually reads the lease.",
      },
      {
        promptId: "share",
        answer: "Board games and a car for grocery runs.",
      },
    ],
  },
  {
    id: "u10",
    name: "Daniel K.",
    photo: person("p-1524504388.jpg"),
    standing: "Senior",
    gender: "man",
    budget: [900, 1200],
    moveIn: SPRING,
    housing: "has-place",
    habits: ["late", "relaxed", "outside", "has-pet"],
    bio: "Studying abroad in spring, need someone to take over my room.",
    consent: true,
    questionnaire: Q_SOCIAL,
    createdDaysAgo: 120,
    extraPhotos: [room("r-1556020685.jpg")],
    prompts: [
      {
        promptId: "ideal-sunday",
        answer: "Coffee on the porch and a slow crossword.",
      },
    ],
  },
  {
    id: "u11",
    name: "Grace Y.",
    photo: person("p-1534528741.jpg"),
    standing: "Sophomore",
    gender: "woman",
    budget: [650, 900],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["flexible", "very-tidy", "no", "none"],
    languages: ["English", "Mandarin"],
    consent: true,
    questionnaire: Q_CALM,
    createdDaysAgo: 25,
  },
  {
    id: "u12",
    name: "Omar F.",
    photo: person("p-1500648767.jpg"),
    standing: "Junior",
    gender: "man",
    budget: [600, 850],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["late", "relaxed", "no", "ok"],
    consent: true,
    questionnaire: Q_SOCIAL,
    createdDaysAgo: 9,
  },
  {
    id: "u13",
    name: "Hannah B.",
    photo: person("p-1544005313.jpg"),
    school: "ESF",
    standing: "Senior",
    gender: "woman",
    budget: [700, 900],
    moveIn: SUMMER,
    housing: "has-place",
    habits: ["early", "tidy", "no", "has-pet"],
    consent: true,
    questionnaire: Q_MIXED,
    createdDaysAgo: 150,
  },
  {
    id: "u14",
    name: "Lucas P.",
    photo: person("p-1506794778.jpg"),
    standing: "Graduate",
    gender: "man",
    budget: [850, 1100],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["early", "tidy", "no", "none"],
    consent: false,
    createdDaysAgo: 35,
  },
  {
    id: "u15",
    name: "Zoe C.",
    photo: person("p-1517841905.jpg"),
    standing: "Freshman",
    gender: "nonbinary",
    budget: [550, 750],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["late", "tidy", "no", "ok"],
    consent: true,
    questionnaire: Q_SOCIAL,
    createdDaysAgo: 14,
  },
  {
    id: "u16",
    name: "Mei Z.",
    photo: person("p-1494790108.jpg"),
    standing: "Admitted · Fall 2027",
    gender: "woman",
    budget: [700, 900],
    moveIn: FALL,
    housing: "needs-place",
    habits: ["early", "tidy", "no", "none"],
    createdDaysAgo: 1,
    verification: "admitted-pending",
  },
];

const BUILDINGS: Building[] = [
  { id: "b-park-point", name: "Park Point Syracuse", kind: "building" },
  { id: "b-copper-beech", name: "Copper Beech Commons", kind: "building" },
  { id: "b-the-marshall", name: "The Marshall", kind: "building" },
  { id: "b-theory", name: "Theory Syracuse", kind: "building" },
  { id: "a-university-hill", name: "University Hill", kind: "area" },
  { id: "a-euclid", name: "Euclid Ave area", kind: "area" },
  { id: "a-westcott", name: "Westcott", kind: "area" },
  { id: "a-downtown", name: "Downtown Syracuse", kind: "area" },
].map((b) => ({
  ...b,
  kind: b.kind as Building["kind"],
  city: "syracuse",
  active: true,
}));

const ONE_LINERS = [
  "Same sleep schedule and overlapping budget.",
  "Both tidy and non-smoking; move-in dates line up.",
  "Budgets overlap, but your sleep schedules differ.",
  "Similar lifestyle; they have a pet and you prefer none.",
  "Move-in dates match; they host guests more often.",
];

function matchFor(viewerId: string, target: UserSeed, index: number): Match {
  const score = Math.max(48, 96 - index * 4);
  const oneLiner = ONE_LINERS[index % ONE_LINERS.length];
  return {
    viewerId,
    targetId: target.id,
    score,
    oneLiner,
    reasons: [
      oneLiner,
      `Budget ${target.budget[0]}–${target.budget[1]} overlaps with yours.`,
      `Sleep: ${target.habits[0]}, cleanliness: ${target.habits[1]}.`,
      target.habits[3] === "has-pet"
        ? "They have a pet — check if that works for you."
        : "No pets on either side.",
    ],
  };
}

export function createSeedWorld(now: Date): DemoWorld {
  const ago = (days: number) => addDays(now, -days);
  const iso = now.toISOString();

  const accounts: Account[] = [];
  const verifications: Verification[] = [];
  const profiles: Profile[] = [];

  for (const u of USERS) {
    accounts.push({
      id: u.id,
      displayName: u.name,
      googleEmail: `${u.id}@gmail.example`,
      birthDate:
        u.id === "me-ana" ? `${now.getFullYear() - 17}-03-14` : "2004-05-02",
      role: u.id === "me-internal" ? "internal" : "user",
      status: u.id === "me-sam" ? "banned" : "active",
      createdAt: ago(u.createdDaysAgo),
      lastActiveAt: ago(u.activeDaysAgo ?? 0),
      emailNotifications: true,
      onboardingStep: "done",
    });

    const kind = u.verification ?? "student";
    const verifiedAt = kind === "expired" ? ago(400) : ago(u.createdDaysAgo);
    verifications.push({
      id: `v-${u.id}`,
      accountId: u.id,
      type:
        kind === "admitted" || kind === "admitted-pending"
          ? "admitted"
          : kind === "graduate"
            ? "graduate"
            : "student",
      schoolEmail:
        kind === "admitted-pending"
          ? null
          : `${u.id}@${u.school === "ESF" ? "esf.edu" : "syr.edu"}`,
      school: u.school ?? "SU",
      status:
        kind === "admitted-pending"
          ? "pending"
          : kind === "expired"
            ? "expired"
            : "approved",
      verifiedAt: kind === "admitted-pending" ? null : verifiedAt,
      expiresAt: kind === "admitted-pending" ? null : addMonths(verifiedAt, 12),
      documentName:
        kind === "admitted-pending" ? `admission-letter-${u.id}.pdf` : null,
      submittedAt: ago(u.createdDaysAgo),
    });

    profiles.push({
      accountId: u.id,
      photo: u.photo,
      displayName: u.name,
      school: u.school ?? "SU",
      standing: u.standing,
      gender: u.gender,
      budgetMin: u.budget[0],
      budgetMax: u.budget[1],
      moveInFrom: u.moveIn[0],
      moveInTo: u.moveIn[1],
      housingStatus: u.housing,
      groupHave: u.group?.[0] ?? null,
      groupNeed: u.group?.[1] ?? null,
      sleep: u.habits[0],
      cleanliness: u.incomplete ? null : u.habits[1],
      smoking: u.incomplete ? null : u.habits[2],
      pets: u.incomplete ? null : u.habits[3],
      major: u.major ?? null,
      languages: u.languages ?? [],
      bio: u.bio ?? null,
      buildingId: u.buildingId ?? null,
      roommateGenderPref: "any",
      extraPhotos: u.extraPhotos ?? [],
      prompts: u.prompts ?? [],
      questionnaire: u.questionnaire ?? null,
      aiMatchConsent: u.consent ?? false,
      searchStatus: u.paused ? "paused" : "active",
      pausedReason: u.paused ? "manual" : null,
      showInBuilding: u.showInBuilding ?? false,
      boostedUntil: null,
    });
  }

  // Admin account has no profile and no verification.
  accounts.push({
    id: "me-admin",
    displayName: "Verimate Team",
    googleEmail: "team@gmail.example",
    birthDate: "1999-01-01",
    role: "admin",
    status: "active",
    createdAt: ago(120),
    lastActiveAt: iso,
    emailNotifications: true,
    onboardingStep: "done",
  });

  const others = USERS.filter((u) => u.id.startsWith("u"));
  const matches: Match[] = ["me-jamie", "me-internal", "me-ana"].flatMap(
    (viewerId) => others.map((u, i) => matchFor(viewerId, u, i)),
  );

  const memberships: Membership[] = [
    {
      accountId: "me-internal",
      kind: "internal",
      startedAt: ago(90),
      endsAt: null,
      lifetimeDiscount: null,
    },
    {
      accountId: "u02",
      kind: "founding",
      startedAt: ago(10),
      endsAt: "2027-05-15T00:00:00.000Z",
      lifetimeDiscount: "50% off the season pass",
    },
  ];

  const sublet = (
    s: Partial<Sublet> & Pick<Sublet, "id" | "authorId" | "title">,
  ): Sublet => ({
    area: null,
    buildingId: null,
    rent: 800,
    startDate: SUMMER[0],
    endDate: SUMMER[1],
    roomType: "private",
    furnished: true,
    photos: [room("r-1484154218.jpg")],
    roommatesInfo: "Two quiet roommates",
    onLeaseDeclared: true,
    exactAddress: null,
    description: null,
    lease: { documentName: null, status: "none" },
    status: "active",
    createdAt: ago(10),
    updatedAt: ago(10),
    staleNotifiedAt: null,
    ...s,
  });

  const sublets: Sublet[] = [
    sublet({
      id: "s01",
      authorId: "me-jamie",
      title: "Summer room in Park Point",
      buildingId: "b-park-point",
      rent: 780,
      photos: [room("u-room-real.jpg"), room("u-kitchen.jpg")],
      exactAddress: "Park Point Syracuse, Unit 4B",
      createdAt: ago(45),
      updatedAt: ago(33),
      staleNotifiedAt: ago(2),
      status: "stale",
    }),
    sublet({
      id: "s02",
      authorId: "u01",
      title: "Bright room on University Hill",
      area: "University Hill",
      buildingId: "a-university-hill",
      rent: 850,
      startDate: FALL[0],
      endDate: FALL[1],
      photos: [room("r-1493809842.jpg"), room("u-living.jpg")],
      exactAddress: "512 Euclid Ave, Apt 2",
      lease: { documentName: null, status: "verified" },
      roommatesInfo: "Two juniors, both non-smokers",
    }),
    sublet({
      id: "s03",
      authorId: "u10",
      title: "Spring takeover near Westcott",
      buildingId: "a-westcott",
      rent: 920,
      startDate: SPRING[0],
      endDate: SPRING[1],
      roomType: "entire",
      photos: [room("r-1502005229.jpg")],
      exactAddress: "214 Westcott St",
      lease: { documentName: "lease-daniel.pdf", status: "pending" },
      description: "Studying abroad in spring. Whole studio, cat-friendly.",
      createdAt: ago(3),
      updatedAt: ago(3),
    }),
    sublet({
      id: "s04",
      authorId: "u03",
      title: "Room at Copper Beech",
      buildingId: "b-copper-beech",
      rent: 700,
      photos: [room("r-1513694203.jpg")],
      status: "subleased",
    }),
    sublet({
      id: "s05",
      authorId: "u08",
      title: "Grad's summer sublet near ESF",
      area: "Euclid Ave area",
      buildingId: "a-euclid",
      rent: 690,
      photos: [room("r-1522708323.jpg"), room("u-room-sofa.jpg")],
      exactAddress: "88 Ostrom Ave",
      lease: { documentName: null, status: "verified" },
    }),
    sublet({
      id: "s06",
      authorId: "u13",
      title: "Shared room downtown, pet OK",
      buildingId: "a-downtown",
      rent: 560,
      roomType: "shared",
      furnished: false,
      photos: [room("r-1556020685.jpg")],
      roommatesInfo: "One ESF senior and a dog",
    }),
    sublet({
      id: "s07",
      authorId: "u02",
      title: "Park Point 4-bed, one room open",
      buildingId: "b-park-point",
      rent: 880,
      startDate: FALL[0],
      endDate: FALL[1],
      photos: [room("r-1567767292.jpg")],
    }),
    sublet({
      id: "s08",
      authorId: "me-internal",
      title: "Summer room in The Marshall",
      buildingId: "b-the-marshall",
      rent: 990,
      photos: [room("r-1598928506.jpg"), room("r-1600210492.jpg")],
      exactAddress: "The Marshall, Unit 1207",
      lease: { documentName: null, status: "verified" },
    }),
    sublet({
      id: "s09",
      authorId: "u12",
      title: "Cheap room, deposit holds it",
      buildingId: "a-university-hill",
      rent: 450,
      photos: [room("r-1617806118.jpg")],
      description:
        "Send the deposit to hold it, I'm out of town so no viewing.",
    }),
    sublet({
      id: "s10",
      authorId: "u15",
      title: "Theory Syracuse studio, summer only",
      buildingId: "b-theory",
      rent: 1050,
      roomType: "entire",
      photos: [room("r-1631049307.jpg")],
    }),
  ];

  return {
    version: DEMO_VERSION,
    seededAt: iso,
    currentPersonaId: "visitor",
    viewAsFree: false,
    verifiedCountOverride: "below50",
    foundingSeatsTakenElsewhere: 26,
    foundingInviteDismissed: [],
    sentEmails: [],
    returnTo: null,
    accounts,
    verifications,
    profiles,
    messageRequests: [
      {
        id: "r1",
        fromId: "u03",
        toId: "me-jamie",
        message:
          "Hi Jamie! Also an early riser looking for next fall. Want to team up?",
        context: { type: "profile" },
        status: "pending",
        createdAt: ago(2),
        respondedAt: null,
      },
      {
        id: "r2",
        fromId: "u09",
        toId: "me-jamie",
        message: "Hey, we need one more for a 3-bed at Park Point!",
        context: { type: "profile" },
        status: "pending",
        createdAt: ago(15),
        respondedAt: null,
      },
      {
        id: "r3",
        fromId: "me-jamie",
        toId: "u11",
        message: "Hi Grace, our habits look really similar. Still looking?",
        context: { type: "profile" },
        status: "pending",
        createdAt: addDays(now, -1 / 24),
        respondedAt: null,
      },
      {
        id: "r4",
        fromId: "u01",
        toId: "me-jamie",
        message:
          "Saw you're looking near campus — my University Hill room might work.",
        context: { type: "sublet", subletId: "s02" },
        status: "accepted",
        createdAt: ago(6),
        respondedAt: ago(5),
      },
    ],
    conversations: [
      {
        id: "c1",
        participantIds: ["u01", "me-jamie"],
        requestId: "r4",
        createdAt: ago(5),
      },
    ],
    messages: [
      {
        id: "m1",
        conversationId: "c1",
        senderId: "u01",
        body: "Saw you're looking near campus — my University Hill room might work.",
        sentAt: ago(6),
        fraudSignals: [],
      },
      {
        id: "m2",
        conversationId: "c1",
        senderId: "me-jamie",
        body: "Sounds great! Could I see it this weekend?",
        sentAt: ago(5),
        fraudSignals: [],
      },
      {
        id: "m3",
        conversationId: "c1",
        senderId: "u01",
        body: "Sure. Some people send a $200 deposit on Venmo to hold it, but no rush.",
        sentAt: ago(4),
        fraudSignals: ["payment"],
      },
    ],
    blocks: [],
    sublets,
    buildings: BUILDINGS,
    matches,
    unlocks: [],
    memberships,
    reports: [
      {
        id: "rep1",
        reporterId: "u03",
        target: { type: "sublet", id: "s09" },
        reason: "Scam",
        note: "Asks for a deposit before any viewing.",
        status: "open",
        resolution: null,
        createdAt: addDays(now, -5 / 24),
        resolvedAt: null,
      },
      {
        id: "rep2",
        reporterId: "u11",
        target: { type: "account", id: "u12" },
        reason: "Fake profile",
        note: "Profile photo looks like a stock image.",
        status: "open",
        resolution: null,
        createdAt: addDays(now, -20 / 24),
        resolvedAt: null,
      },
    ],
    profileViews: [
      { viewerId: "u03", targetId: "me-jamie", viewedAt: ago(1) },
      { viewerId: "u09", targetId: "me-jamie", viewedAt: ago(2) },
      { viewerId: "u01", targetId: "me-internal", viewedAt: ago(1) },
      { viewerId: "u11", targetId: "me-internal", viewedAt: ago(3) },
    ],
    alerts: [
      {
        id: "al1",
        accountId: "me-internal",
        text: "New 91% match: Jason L. is looking for next fall.",
        href: "/roommates/u03",
        createdAt: ago(1),
      },
      {
        id: "al2",
        accountId: "me-internal",
        text: "New sublet near you: Grad's summer sublet near ESF.",
        href: "/sublets/s05",
        createdAt: ago(2),
      },
    ],
  };
}
