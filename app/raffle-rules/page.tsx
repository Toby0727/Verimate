import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { RAFFLE } from "@/lib/waitlist/options";

export const metadata: Metadata = {
  title: "Verimate · Raffle rules",
};

// Official rules for the waitlist raffle. Keep dates in sync with RAFFLE.
export default function RaffleRulesPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background">
      <header className="px-4 pt-5 pb-2">
        <Link href="/" className="inline-block">
          <Logo className="h-8 w-auto" />
        </Link>
      </header>
      <main className="flex flex-col gap-4 p-4">
        <h1 className="font-semibold text-[26px] tracking-tight">
          Waitlist raffle: official rules
        </h1>
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 text-[14px] leading-relaxed">
          <p className="font-semibold">
            No purchase necessary. A purchase will not increase your chances of
            winning.
          </p>
          <Rule title="Sponsor">
            The Verimate team (“Verimate”), a student project in Syracuse, New
            York.
          </Rule>
          <Rule title="Who can enter">
            Students currently enrolled at Syracuse University or SUNY ESF who
            are 18 or older. You can sign in with your school Google account or
            a personal one; if you win on a personal account, we'll ask for
            proof that you're enrolled before sending the prize. Verimate team
            members can't win. Void where prohibited.
          </Rule>
          <Rule title="How to enter">
            Sign in at verimate.org with a Google account and answer every
            waitlist question. That's one entry; editing your answers doesn't
            add entries. Use one account per person.
          </Rule>
          <Rule title="Bonus entries">
            Get one extra entry for signing in with your school Google account
            (@g.syr.edu or @esf.edu), and one for adding a clear photo of your
            own face, for at most three entries per person. Photos that aren't
            of you don't earn the bonus. Both are optional and not needed to
            enter.
          </Rule>
          <Rule title="Referral bonus">
            After you finish, you get a referral code. Each other eligible
            student who signs in with their own school Google account, enters
            your code and finishes every question raises your chance by 10% of
            your entries (for example, 3 friends make 1 entry count as 1.3).
            Your own code and codes from your other accounts don't count, and
            each student can use only one code.
          </Rule>
          <Rule title="Entry period">
            Entries close at 11:59 PM Eastern on {RAFFLE.endsLabel}.
          </Rule>
          <Rule title="Prize">
            One winner gets a {RAFFLE.prize}. The prize can't be exchanged for
            cash. Your odds depend on how many eligible entries we receive.
          </Rule>
          <Rule title="Drawing and notification">
            We'll draw one winner at random from all eligible entries by{" "}
            {RAFFLE.drawnBy} and email them at their school address. If the
            winner doesn't reply within 7 days, we'll draw another winner.
          </Rule>
          <Rule title="Your information">
            We use your school email, name, photo and answers to run the raffle,
            contact you, and plan Verimate. Your photo is stored privately and
            only the Verimate team can see it. We won't sell your information.
            Details and how to delete it are in our{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              privacy policy
            </Link>
            .
          </Rule>
          <Rule title="Not affiliated">
            Amazon is not a sponsor of this raffle and isn't involved in it.
            Syracuse University and SUNY ESF don't sponsor or endorse this
            raffle or Verimate.
          </Rule>
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

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-muted-foreground">{children}</p>
    </section>
  );
}
