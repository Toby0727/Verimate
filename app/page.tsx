import { BadgeCheck, MessageCircleHeart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrowseAsVisitor } from "@/components/onboarding/browse-as-visitor";
import { VisitorPreview } from "@/components/onboarding/visitor-preview";
import { buttonVariants } from "@/components/ui/button";

const POINTS = [
  {
    icon: BadgeCheck,
    title: "Only verified students",
    body: "Everyone verifies an SU or ESF email, or an admission letter.",
  },
  {
    icon: MessageCircleHeart,
    title: "Find people, then places",
    body: "Match on budget, dates and habits. Sublets live here too.",
  },
  {
    icon: ShieldCheck,
    title: "Safety built in",
    body: "Message requests, blocking, reports and scam warnings.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background shadow-sm">
      <main className="flex flex-col gap-8 px-5 py-10">
        <div className="flex flex-col gap-4">
          <span className="font-bold text-2xl text-primary tracking-tight">
            Verimate
          </span>
          <h1 className="font-semibold text-3xl tracking-tight">
            Find a roommate you can actually trust.
          </h1>
          <p className="text-muted-foreground">
            The verified roommate platform for Syracuse University and SUNY ESF
            students — plus sublets from people on the lease.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/sign-in" className={buttonVariants({ size: "lg" })}>
              Sign in with Google (Sample)
            </Link>
            <BrowseAsVisitor />
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground text-sm">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <VisitorPreview />

        <footer className="flex gap-4 text-muted-foreground text-xs">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/about-demo">About this demo</Link>
        </footer>
      </main>
    </div>
  );
}
