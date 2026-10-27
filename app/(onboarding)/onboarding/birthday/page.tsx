import { BirthdayForm } from "@/components/onboarding/birthday-form";
import { OnboardingStep } from "@/components/onboarding/onboarding-step";

export default function BirthdayPage() {
  return (
    <OnboardingStep step={0} title="When's your birthday?">
      <BirthdayForm />
    </OnboardingStep>
  );
}
