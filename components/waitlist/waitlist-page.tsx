"use client";

import {
  Cannabis,
  Check,
  Cigarette,
  Gift,
  Landmark,
  Loader2,
  Moon,
  PawPrint,
  Sparkles,
  Users,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import {
  signInWithGoogle,
  signOutOfGoogle,
} from "@/components/onboarding/google-sign-in";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  firstOpenStep,
  isReferralCode,
  isStepDone,
  MAJOR_MAX_LENGTH,
  NAME_MAX_LENGTH,
  needsCurrentHome,
  normalizeReferralCode,
  normalizeSource,
  raffleBoost,
  raffleEntries,
  setAbroadPlace,
  stepsLeft,
  toggle,
  toggleAbroad,
  toggleArea,
  WAITLIST_STEPS,
  type WaitlistAnswers,
  type WaitlistStep,
} from "@/lib/rules/waitlist";
import { cn } from "@/lib/utils";
import {
  forgetReferral,
  InvalidReferralCode,
  loadReferralCount,
  loadWaitlist,
  rememberedReferral,
  rememberReferral,
  rememberSource,
  saveWaitlist,
  type WaitlistSession,
} from "@/lib/waitlist/api";
import {
  AREAS,
  BUDGETS,
  CANNABIS,
  CLEANLINESS,
  DRINKING,
  GENDERS,
  GREEK_LIFE,
  GUESTS,
  PETS,
  RAFFLE,
  SLEEP,
  SMOKING,
  YEARS,
} from "@/lib/waitlist/options";
import { AreaListings } from "./area-listings";
import { AreaMap } from "./area-map";
import { CurrentHome } from "./current-home";
import { HobbyPicker } from "./hobby-picker";
import { MultiChips } from "./multi-chips";
import { OpenInBrowser, useInAppBrowser } from "./open-in-browser";
import { PhotoPicker } from "./photo-picker";
import { ProfileCard } from "./profile-card";
import { Confetti, GiftCard, RafflePill } from "./raffle-hype";
import { ReferralCard, referralLink } from "./referral-card";
import { AbroadPlanList, IconQuestion, TimingGrid } from "./step-parts";

type SignedIn = Extract<WaitlistSession, { status: "signed-in" }>;
type View =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "signed-out" }
  | { kind: "survey"; session: SignedIn; step: WaitlistStep }
  | { kind: "done"; session: SignedIn };

const WAITLIST_PATH = "/";

function viewFor(session: WaitlistSession): View {
  if (session.status === "signed-out") return { kind: "signed-out" };
  const open = firstOpenStep(session.answers);
  return open
    ? { kind: "survey", session, step: open }
    : { kind: "done", session };
}

export function WaitlistPage() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const ref = normalizeReferralCode(
      new URLSearchParams(window.location.search).get("ref") ?? "",
    );
    if (isReferralCode(ref)) rememberReferral(ref);
    const src = normalizeSource(
      new URLSearchParams(window.location.search).get("src"),
    );
    if (src) rememberSource(src);
    if (new URLSearchParams(window.location.search).has("signin")) {
      toast.error("Google sign-in didn't finish. Please try again.");
      window.history.replaceState(null, "", WAITLIST_PATH);
    }
    loadWaitlist()
      .then((session) => {
        if (!cancelled) setView(viewFor(session));
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setView({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background">
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <Logo className="h-8 w-auto" />
        <RafflePill />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4">
        {view.kind === "loading" ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : view.kind === "error" ? (
          <ErrorCard />
        ) : view.kind === "signed-out" ? (
          <Landing />
        ) : view.kind === "survey" ? (
          <Survey
            session={view.session}
            step={view.step}
            onStep={(step, session) =>
              setView({ kind: "survey", session, step })
            }
            onDone={(session) => setView({ kind: "done", session })}
          />
        ) : view.kind === "done" ? (
          <Done
            session={view.session}
            onEdit={() =>
              setView({ kind: "survey", session: view.session, step: "about" })
            }
          />
        ) : null}
      </main>
      <footer className="px-4 pb-6 text-center text-[12px] text-muted-foreground">
        No purchase necessary. Ends {RAFFLE.endsLabel}.{" "}
        <Link href="/raffle-rules" className="underline underline-offset-2">
          Official rules
        </Link>
        {" · "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy
        </Link>
      </footer>
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [redirecting, setRedirecting] = useState(false);
  return (
    <Button
      size="lg"
      disabled={redirecting}
      onClick={async () => {
        setRedirecting(true);
        await signInWithGoogle(WAITLIST_PATH);
        // Only reached when the redirect to Google failed.
        setRedirecting(false);
      }}
    >
      {redirecting ? <Loader2 className="animate-spin" /> : null}
      {label}
    </Button>
  );
}

const PERKS: { title: string; body: string }[] = [
  {
    title: "Your first month free",
    body: "Everyone on the waitlist gets a month of Verimate on us at launch.",
  },
  {
    title: `A shot at a ${RAFFLE.prize}`,
    body: `Drawn from everyone who finishes the survey. Entries close ${RAFFLE.endsLabel}.`,
  },
  {
    title: "Better odds, your way",
    body: "Sign in with your school account for +5%, add a real photo for a bonus entry, and get +10% for every friend who joins with your code.",
  },
];

// The signed-out homepage: an editorial hero, the prize, and what joining
// gets you, separated by rules rather than stacked cards.
function Landing() {
  const inApp = useInAppBrowser();
  const [tryAnyway, setTryAnyway] = useState(false);
  return (
    <div className="flex flex-col gap-8 pt-2">
      <section className="flex flex-col gap-5">
        <span className="font-semibold text-[11px] text-verified uppercase tracking-[0.2em]">
          SU & ESF · Launching soon
        </span>
        <h1 className="font-semibold text-[36px] leading-[1.05] tracking-[-0.03em]">
          Building the most complete{" "}
          <span className="text-verified">sublet + roommate</span> matching for
          off-campus living.
        </h1>
        <p className="max-w-[34ch] text-[16px] text-muted-foreground leading-relaxed">
          For SU & ESF students. Join the waitlist in about a minute.
        </p>
        <div className="flex flex-col gap-2">
          {inApp && !tryAnyway ? (
            <OpenInBrowser
              browser={inApp}
              onTryAnyway={() => setTryAnyway(true)}
            />
          ) : (
            <GoogleButton label="Continue with Google" />
          )}
          <p className="text-[12px] text-muted-foreground">
            Use your <b className="font-semibold text-foreground">@g.syr.edu</b>{" "}
            account (SU and ESF students both have one) to get verified and a{" "}
            <b className="font-semibold text-verified">
              5% better chance to win the {RAFFLE.prize}
            </b>
            . A personal Google account works too. We only use your email to
            contact you.
          </p>
        </div>
      </section>

      <GiftCard />

      <section className="flex flex-col">
        <h2 className="pb-3 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
          What you get for joining
        </h2>
        <ol className="flex flex-col border-border border-t">
          {PERKS.map((perk, i) => (
            <li
              key={perk.title}
              className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-border border-b py-4"
            >
              <span className="font-semibold text-[15px] text-verified tabular-nums leading-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-semibold text-[16px] leading-tight">
                  {perk.title}
                </span>
                <span className="text-[14px] text-muted-foreground leading-snug">
                  {perk.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// Shown to students on a personal Google account: switching to their school
// account verifies them and earns a bonus entry.
function SchoolNudge() {
  const [switching, setSwitching] = useState(false);
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-verified-tint p-3">
      <span className="text-[13px] text-verified">
        You're on a personal account. Sign in with your <b>@g.syr.edu</b>{" "}
        account (SU and ESF students both have one) to get verified and a 5%
        better chance to win the {RAFFLE.prize}.
      </span>
      <Button
        size="sm"
        variant="outline"
        className="self-start bg-white"
        disabled={switching}
        onClick={async () => {
          setSwitching(true);
          await signOutOfGoogle();
          await signInWithGoogle(WAITLIST_PATH);
          setSwitching(false);
        }}
      >
        Switch to my school account
      </Button>
    </div>
  );
}

function entriesText(session: SignedIn): string {
  const entries =
    raffleEntries(session.answers) === 2
      ? "2 entries (one bonus for your photo)"
      : "1 entry";
  return session.school
    ? `${entries}, plus a 5% better chance for your school account`
    : entries;
}

function ErrorCard() {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card p-5">
      <h1 className="font-semibold text-[22px] tracking-tight">
        Something went wrong
      </h1>
      <p className="text-[15px] text-muted-foreground">
        We couldn't load your answers. Check your connection and try again.
      </p>
      <Button size="lg" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </section>
  );
}

const STEP_TITLES: Record<WaitlistStep, string> = {
  about: "About you",
  budget: "What's your monthly rent budget?",
  areas: "Where would you like to live?",
  abroad: "Planning to study abroad?",
  timing: "When do you need housing help?",
  lifestyle: "Quick lifestyle check",
  hobbies: "What are you into?",
};

function Survey({
  session,
  step,
  onStep,
  onDone,
}: {
  session: SignedIn;
  step: WaitlistStep;
  onStep: (step: WaitlistStep, session: SignedIn) => void;
  onDone: (session: SignedIn) => void;
}) {
  const [answers, setAnswers] = useState<WaitlistAnswers>(() => {
    // A friend's code from their invite link fills in step 1.
    const ref = rememberedReferral();
    return !session.answers.referredBy && !session.completedAt && ref
      ? { ...session.answers, referredBy: ref }
      : session.answers;
  });
  const [saving, setSaving] = useState(false);
  const index = WAITLIST_STEPS.indexOf(step);
  const isLast = index === WAITLIST_STEPS.length - 1;
  const set = (patch: Partial<WaitlistAnswers>) =>
    setAnswers((a) => ({ ...a, ...patch }));

  async function next() {
    setSaving(true);
    try {
      let toSave = answers;
      let result: Awaited<ReturnType<typeof saveWaitlist>>;
      try {
        result = await saveWaitlist(session, toSave);
      } catch (error) {
        // A code saved earlier stops working if its owner deleted their
        // data: drop it and save again instead of blocking the student.
        const stale =
          error instanceof InvalidReferralCode &&
          toSave.referredBy !== null &&
          toSave.referredBy === session.answers.referredBy;
        if (!stale) throw error;
        toSave = { ...toSave, referredBy: null };
        setAnswers(toSave);
        result = await saveWaitlist(session, toSave);
        toast("That referral code no longer exists, so we removed it.");
      }
      // The friend's code from an invite link has done its job.
      if (toSave.referredBy) forgetReferral();
      const { completedAt, referralCode } = result;
      const saved = {
        ...session,
        answers: toSave,
        completedAt,
        referralCode,
      };
      const open = firstOpenStep(toSave);
      if (isLast) {
        if (open) onStep(open, saved);
        else onDone(saved);
      } else {
        // Move forward; jump back only if an earlier step is still open.
        // Editing a finished survey walks through every step.
        const earlierOpen = open && WAITLIST_STEPS.indexOf(open) < index;
        onStep(earlierOpen ? open : WAITLIST_STEPS[index + 1], saved);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof InvalidReferralCode
          ? "That referral code doesn't work. Check it, or leave it empty."
          : "Couldn't save your answers. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Progress
        index={index}
        // Counts this step until it's saved.
        left={stepsLeft(session.answers)}
        entered={session.completedAt !== null}
      />

      <section className="flex flex-col gap-5 rounded-2xl bg-card p-5">
        <h1 className="font-semibold text-[22px] leading-tight tracking-tight">
          {STEP_TITLES[step]}
        </h1>
        <StepFields step={step} session={session} answers={answers} set={set} />
      </section>

      <div className="flex gap-2">
        {index > 0 ? (
          <Button
            size="lg"
            variant="outline"
            disabled={saving}
            onClick={() =>
              onStep(WAITLIST_STEPS[index - 1], { ...session, answers })
            }
          >
            Back
          </Button>
        ) : null}
        <Button
          size="lg"
          className="flex-1"
          disabled={saving || !isStepDone(step, answers)}
          onClick={next}
        >
          {saving ? <Loader2 className="animate-spin" /> : null}
          {isLast ? "Submit and enter the raffle" : "Continue"}
        </Button>
      </div>
    </>
  );
}

function Progress({
  index,
  left,
  entered,
}: {
  index: number;
  left: number;
  entered: boolean;
}) {
  const total = WAITLIST_STEPS.length;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium">
          Step {index + 1} of {total}
        </span>
        <span
          className={cn(
            entered || left <= 1
              ? "font-medium text-verified"
              : "text-muted-foreground",
          )}
        >
          {entered
            ? "You're already in the raffle"
            : left <= 1
              ? "Last step to enter the raffle!"
              : `Only ${left} steps left to enter the raffle`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-verified-fill transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <Gift
          aria-hidden
          className={cn(
            "size-4 text-verified",
            (entered || left <= 2) && "hype-wiggle",
          )}
        />
      </div>
    </div>
  );
}

function Question({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-[15px]">{label}</span>
      {children}
    </div>
  );
}

function StepFields({
  step,
  session,
  answers,
  set,
}: {
  step: WaitlistStep;
  session: SignedIn;
  answers: WaitlistAnswers;
  set: (patch: Partial<WaitlistAnswers>) => void;
}) {
  switch (step) {
    case "about":
      return (
        <>
          {session.school === null && <SchoolNudge />}
          <Question label="Name">
            <Input
              aria-label="Name"
              placeholder="First and last name"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              value={answers.name ?? ""}
              onChange={(e) => set({ name: e.target.value || null })}
            />
          </Question>
          <Question label="Gender">
            <ChoiceChips
              label="Gender"
              options={[...GENDERS]}
              value={answers.gender}
              onChange={(gender) => set({ gender })}
            />
          </Question>
          <PhotoPicker
            session={session}
            path={answers.photoPath}
            onChange={(photoPath) => set({ photoPath })}
          />
          <Question label="Year">
            <ChoiceChips
              label="Year"
              options={[...YEARS]}
              value={answers.year}
              onChange={(year) => set({ year })}
            />
          </Question>
          <Question label="Major">
            <Input
              aria-label="Major"
              placeholder="e.g. Information Management"
              maxLength={MAJOR_MAX_LENGTH}
              value={answers.major ?? ""}
              onChange={(e) => set({ major: e.target.value || null })}
            />
          </Question>
          <Question label="Referral code (optional)">
            <Input
              aria-label="Referral code"
              placeholder="From a friend, e.g. 3F9A2C"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="font-mono tracking-[0.15em] uppercase"
              value={answers.referredBy ?? ""}
              onChange={(e) =>
                set({
                  referredBy: normalizeReferralCode(e.target.value) || null,
                })
              }
            />
            <span className="text-[12px] text-muted-foreground">
              Your friend gets a 10% better chance to win when you finish on
              your school account.
            </span>
          </Question>
        </>
      );
    case "budget":
      return (
        <Question label="Per person, per month. Pick all that work.">
          <MultiChips
            label="Budget"
            options={BUDGETS}
            value={answers.budget}
            onToggle={(budget) =>
              set({ budget: toggle(answers.budget, budget) })
            }
          />
        </Question>
      );
    case "areas":
      return (
        <Question label="Tap every area on the map that works for you">
          <AreaMap
            value={answers.areas}
            onToggle={(area) => set({ areas: toggleArea(answers.areas, area) })}
          />
          <MultiChips
            label="Areas"
            options={AREAS}
            value={answers.areas}
            onToggle={(area) => set({ areas: toggleArea(answers.areas, area) })}
          />
          <AreaListings areas={answers.areas} />
        </Question>
      );
    case "abroad":
      return (
        <Question label="Pick every term you'll be away and where. You may need to sublet your place.">
          <AbroadPlanList
            studyAbroad={answers.studyAbroad}
            plans={answers.studyAbroadPlans}
            onToggle={(value) =>
              set(toggleAbroad(answers.studyAbroadPlans, value))
            }
            onPlace={(term, place) =>
              set({
                studyAbroadPlans: setAbroadPlace(
                  answers.studyAbroadPlans ?? [],
                  term,
                  place,
                ),
              })
            }
          />
        </Question>
      );
    case "timing":
      return (
        <>
          <TimingGrid
            away={answers.studyAbroadPlans}
            columns={[
              {
                label: "Sublet my place",
                value: answers.subletOutTerms,
                initial: answers.studyAbroadPlans?.map((plan) => plan.term),
                onChange: (subletOutTerms) => set({ subletOutTerms }),
              },
              {
                label: "Find a sublet",
                value: answers.subletInTerms,
                onChange: (subletInTerms) => set({ subletInTerms }),
              },
              {
                label: "Find roommates",
                value: answers.roommateTerms,
                onChange: (roommateTerms) => set({ roommateTerms }),
              },
            ]}
          />
          {needsCurrentHome(answers) ? (
            <CurrentHome
              value={answers.currentHome}
              onChange={(currentHome) => set({ currentHome })}
            />
          ) : null}
        </>
      );
    case "lifestyle":
      return (
        <>
          <IconQuestion icon={Wine} label="Drinking">
            <ChoiceChips
              label="Drinking"
              options={[...DRINKING]}
              value={answers.drinking}
              onChange={(drinking) => set({ drinking })}
            />
          </IconQuestion>
          <IconQuestion icon={Cigarette} label="Smoking or vaping">
            <ChoiceChips
              label="Smoking or vaping"
              options={[...SMOKING]}
              value={answers.smoking}
              onChange={(smoking) => set({ smoking })}
            />
          </IconQuestion>
          <IconQuestion icon={Cannabis} label="Weed">
            <ChoiceChips
              label="Weed"
              options={[...CANNABIS]}
              value={answers.cannabis}
              onChange={(cannabis) => set({ cannabis })}
            />
          </IconQuestion>
          <IconQuestion icon={Landmark} label="Greek life">
            <ChoiceChips
              label="Greek life"
              options={[...GREEK_LIFE]}
              value={answers.greekLife}
              onChange={(greekLife) => set({ greekLife })}
            />
          </IconQuestion>
          <IconQuestion icon={PawPrint} label="Pets">
            <ChoiceChips
              label="Pets"
              options={[...PETS]}
              value={answers.pets}
              onChange={(pets) => set({ pets })}
            />
          </IconQuestion>
          <IconQuestion icon={Moon} label="Sleep schedule">
            <ChoiceChips
              label="Sleep schedule"
              options={[...SLEEP]}
              value={answers.sleep}
              onChange={(sleep) => set({ sleep })}
            />
          </IconQuestion>
          <IconQuestion icon={Sparkles} label="How tidy are you?">
            <ChoiceChips
              label="How tidy are you?"
              options={[...CLEANLINESS]}
              value={answers.cleanliness}
              onChange={(cleanliness) => set({ cleanliness })}
            />
          </IconQuestion>
          <IconQuestion icon={Users} label="Guests over">
            <ChoiceChips
              label="Guests over"
              options={[...GUESTS]}
              value={answers.guests}
              onChange={(guests) => set({ guests })}
            />
          </IconQuestion>
        </>
      );
    case "hobbies":
      return (
        <Question label="Tap everything you're into, or add your own. We'll use it to match you with roommates.">
          <HobbyPicker
            hobbies={answers.hobbies}
            custom={answers.customHobbies}
            onHobbies={(hobbies) => set({ hobbies })}
            onCustom={(customHobbies) => set({ customHobbies })}
          />
        </Question>
      );
  }
}

function Done({ session, onEdit }: { session: SignedIn; onEdit: () => void }) {
  const [friends, setFriends] = useState(0);
  useEffect(() => {
    let cancelled = false;
    loadReferralCount()
      .then((n) => {
        if (!cancelled) setFriends(n);
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, []);

  async function share() {
    const url = session.referralCode
      ? referralLink(session.referralCode)
      : window.location.origin;
    const text = `Join the Verimate waitlist and get a chance to win a ${RAFFLE.prize}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Verimate", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // The share sheet was closed.
    }
  }

  return (
    <>
      <div className="relative">
        <Confetti />
        <GiftCard
          entries={raffleEntries(session.answers)}
          boost={Math.round(
            raffleBoost(session.school !== null, friends) * 100,
          )}
        />
      </div>
      <section className="flex flex-col gap-4 rounded-2xl bg-card p-5">
        <ProfileCard answers={session.answers} school={session.school} />
        <div className="h-px bg-border" />
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="hype-pop grid size-12 place-items-center rounded-full bg-verified-fill text-white">
            <Check className="size-6" strokeWidth={3} />
          </span>
          <h1 className="font-semibold text-[24px] tracking-tight">
            You're entered!
          </h1>
          <p className="text-[15px] text-muted-foreground">
            You're on the Verimate waitlist and in the {RAFFLE.prize} raffle
            with {entriesText(session)}. Entries close {RAFFLE.endsLabel}, and
            we'll email you the result. Your first month of Verimate is free
            when we launch.
          </p>
        </div>
      </section>
      {session.school === null && <SchoolNudge />}
      <ReferralCard code={session.referralCode} friends={friends} />

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={share}>
          Share my invite link
        </Button>
        <Button size="lg" variant="outline" onClick={onEdit}>
          Edit my answers
        </Button>
        <button
          type="button"
          className="py-2 text-[13px] text-muted-foreground underline"
          onClick={async () => {
            await signOutOfGoogle();
            window.location.assign(WAITLIST_PATH);
          }}
        >
          Sign out
        </button>
      </div>
    </>
  );
}
