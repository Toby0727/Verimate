import { OnboardingProfile } from "@/components/onboarding/onboarding-profile";
import { OnboardingStep } from "@/components/onboarding/onboarding-step";

export default function ProfilePage() {
  return (
    <OnboardingStep step={3} title="Tell people about you">
      <OnboardingProfile />
    </OnboardingStep>
  );
}
