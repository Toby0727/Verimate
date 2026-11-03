"use client";

import {
  Cannabis,
  Check,
  Cigarette,
  Gift,
  Landmark,
  Loader2,
  PawPrint,
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
  isStepDone,
  MAJOR_MAX_LENGTH,
  NAME_MAX_LENGTH,
  raffleEntries,
  stepsLeft,
  toggle,
  toggleArea,
  WAITLIST_STEPS,
  type WaitlistAnswers,
  type WaitlistStep,
} from "@/lib/rules/waitlist";
import {
  loadWaitlist,
  saveWaitlist,
  type WaitlistSession,
} from "@/lib/waitlist/api";
import {
  AREAS,
  BUDGETS,
  CANNABIS,
  DRINKING,
  GENDERS,
  GREEK_LIFE,
  PETS,
  RAFFLE,
  SMOKING,
  STUDY_ABROAD,
  YEARS,
} from "@/lib/waitlist/options";
import { AreaListings } from "./area-listings";
import { AreaMap } from "./area-map";
import { MultiChips } from "./multi-chips";
import { PhotoPicker } from "./photo-picker";
import { IconQuestion, TermList, TimingGrid } from "./step-parts";

type SignedIn = Extract<WaitlistSession, { status: "signed-in" }>;
type View =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "signed-out" }
  | { kind: "not-school"; email: string }
  | { kind: "survey"; session: SignedIn; step: WaitlistStep }
  | { kind: "done"; session: SignedIn };

const WAITLIST_PATH = "/";

function viewFor(session: WaitlistSession): View {
  if (session.status === "signed-out") return { kind: "signed-out" };
  if (session.status === "not-school") {
    return { kind: "not-school", email: session.email };
  }
  const open = firstOpenStep(session.answers);
  return open
    ? { kind: "survey", session, step: open }
    : { kind: "done", session };
}

export function WaitlistPage() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
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
        ) : view.kind === "not-school" ? (
          <NotSchool email={view.email} />
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

function RafflePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-verified-tint px-2.5 py-1 font-medium text-[12px] text-verified">
      <Gift className="size-3.5" />
      Win a $50 Amazon gift card
    </span>
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

function Landing() {
  return (
    <>
      <section className="flex flex-col gap-3 rounded-2xl bg-card p-5">
        <h1 className="font-semibold text-[26px] leading-tight tracking-tight">
          Roommates and sublets, only with verified SU & ESF students.
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Verimate is launching soon. Join the waitlist with 6 quick questions
          (about a minute) and you're entered to win a {RAFFLE.prize}.
        </p>
      </section>

      <ol className="flex flex-col gap-2 rounded-2xl bg-card p-5 text-[15px]">
        {[
          "Sign in with your school Google account",
          "Answer 6 quick questions",
          "You're on the waitlist and in the raffle",
        ].map((text, i) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted font-semibold text-[12px]">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2">
        <GoogleButton label="Continue with school Google" />
        <p className="text-center text-[12px] text-muted-foreground">
          Use your @syr.edu or @esf.edu account. We only use it to confirm
          you're a student and to contact you.
        </p>
      </div>
    </>
  );
}

function NotSchool({ email }: { email: string }) {
  const [switching, setSwitching] = useState(false);
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card p-5">
      <h1 className="font-semibold text-[22px] leading-tight tracking-tight">
        Use your school account
      </h1>
      <p className="text-[15px] text-muted-foreground">
        You signed in as <span className="text-foreground">{email}</span>.
        Verimate is only for SU and ESF students, so sign in with your @syr.edu
        or @esf.edu Google account instead.
      </p>
      <Button
        size="lg"
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
    </section>
  );
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
  const [answers, setAnswers] = useState<WaitlistAnswers>(session.answers);
  const [saving, setSaving] = useState(false);
  const index = WAITLIST_STEPS.indexOf(step);
  const isLast = index === WAITLIST_STEPS.length - 1;
  const set = (patch: Partial<WaitlistAnswers>) =>
    setAnswers((a) => ({ ...a, ...patch }));

  async function next() {
    setSaving(true);
    try {
      const { completedAt } = await saveWaitlist(session, answers);
      const saved = { ...session, answers, completedAt };
      const open = firstOpenStep(answers);
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
      toast.error("Couldn't save your answers. Try again.");
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
        <span className="text-muted-foreground">
          {entered
            ? "You're already in the raffle"
            : left <= 1
              ? "Last step to enter the raffle!"
              : `Only ${left} steps left to enter the raffle`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-verified-fill transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
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
        <Question label="If so, which term? You may need to sublet your place.">
          <TermList
            label="Study abroad"
            options={STUDY_ABROAD}
            value={answers.studyAbroad}
            onChange={(studyAbroad) => set({ studyAbroad })}
          />
        </Question>
      );
    case "timing":
      return (
        <TimingGrid
          columns={[
            {
              label: "Sublet my place",
              value: answers.subletOutTerms,
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
        </>
      );
  }
}

function Done({ session, onEdit }: { session: SignedIn; onEdit: () => void }) {
  async function share() {
    const url = window.location.origin;
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
      <section className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-verified-fill text-white">
          <Check className="size-6" strokeWidth={3} />
        </span>
        <h1 className="font-semibold text-[24px] tracking-tight">
          You're entered!
        </h1>
        <p className="text-[15px] text-muted-foreground">
          You're on the Verimate waitlist and in the {RAFFLE.prize} raffle with{" "}
          {raffleEntries(session.answers) === 2
            ? "2 entries (one bonus for your photo)"
            : "1 entry"}
          . We'll draw the winner by {RAFFLE.drawnBy} and email{" "}
          <span className="text-foreground">{session.email}</span> if you win,
          and again when Verimate launches.
        </p>
      </section>

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={share}>
          Share with friends
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
