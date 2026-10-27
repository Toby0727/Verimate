import { LandingFeed } from "@/components/onboarding/landing-feed";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background shadow-sm">
      <LandingFeed />
    </div>
  );
}
