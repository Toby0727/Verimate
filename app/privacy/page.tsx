import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { CONTACT_EMAIL } from "@/lib/waitlist/options";

export const metadata: Metadata = {
  title: "Verimate · Privacy policy",
};

// The live privacy policy for the waitlist (also the URL on Google's OAuth
// consent screen). Keep it in step with what lib/waitlist/api.ts collects.
export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background">
      <header className="px-4 pt-5 pb-2">
        <Link href="/" className="inline-block">
          <Logo className="h-8 w-auto" />
        </Link>
      </header>
      <main className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-[26px] tracking-tight">
            Privacy policy
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Effective November 3, 2026
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 text-[14px] leading-relaxed">
          <Section title="Who we are">
            Verimate is a student project in Syracuse, New York, building a
            roommate and sublet app for Syracuse University and SUNY ESF
            students. Right now verimate.org runs our waitlist and gift card
            raffle. Questions or requests: <Email />.
          </Section>
          <Section title="What we collect">
            <List
              items={[
                "From Google when you sign in: your name, email address, Google account ID and the profile picture link Google shares. We never see your Google password.",
                "Your survey answers: name, gender, year, major, rent budget, areas you'd live in, study abroad plans, when you need a sublet or roommate, your drinking, smoking and cannabis answers, Greek life, and pets.",
                "Your referral code, and the code of the friend who invited you, if any. We use them only to count referral bonuses; friends don't see each other's answers. A photo of you, only if you choose to upload one. Your browser shrinks it and removes its hidden data, such as the location it was taken, before it's sent.",
                "Basic technical data: a sign-in cookie that keeps you signed in, and the IP address and browser details our hosting providers log when you visit.",
              ]}
            />
          </Section>
          <Section title="How we use it">
            To run the waitlist and the raffle, check that you're an SU or ESF
            student, contact you if you win and when Verimate launches, and plan
            the app from everyone's answers taken together. We don't sell your
            information, use it for ads, or let other companies market to you.
          </Section>
          <Section title="Who can see it">
            Only the Verimate team. Your answers and photo aren't shown to other
            students, and we don't share them with Syracuse University, SUNY ESF
            or landlords. If the app later uses them in your profile, we'll ask
            you first. We use these services to run the site, and they handle
            data only to provide them: Supabase (database, photo storage and
            sign-in), Vercel (hosting), Google (sign-in) and OpenFreeMap (the
            map on the survey, built on OpenStreetMap data, which your browser
            loads directly).
          </Section>
          <Section title="How long we keep it">
            Until Verimate launches, so we can invite you, or until you ask us
            to delete it, whichever comes first. If Verimate doesn't launch, we
            delete waitlist data within 12 months of the raffle drawing.
          </Section>
          <Section title="Your choices">
            You can change your answers any time by signing in again. To see or
            delete everything we have about you, including your photo and
            account, email <Email /> from the address you signed in with and
            we'll do it within 30 days.
          </Section>
          <Section title="Security">
            Each student can read and change only their own answers, photos are
            stored privately, and the site is served only over HTTPS. No system
            is perfectly secure, so we collect only what the waitlist needs.
          </Section>
          <Section title="Age">
            Verimate is for college students. The raffle is open only to
            students 18 or older, and we don't knowingly collect information
            from anyone under 13.
          </Section>
          <Section title="Changes">
            If we change this policy, we'll update it here with a new date, and
            email you first about any change in how we use your answers.
          </Section>
        </div>
        <Link
          href="/"
          className="text-center text-[14px] underline underline-offset-2"
        >
          Back to the waitlist
        </Link>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-semibold">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Email() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-foreground underline underline-offset-2"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
