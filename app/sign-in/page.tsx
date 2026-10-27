import { SignInCard } from "@/components/onboarding/sign-in-card";
import { SimplePage } from "@/components/shell/simple-page";

export default function SignInPage() {
  return (
    <SimplePage title="Sign in" backHref="/">
      <SignInCard />
    </SimplePage>
  );
}
