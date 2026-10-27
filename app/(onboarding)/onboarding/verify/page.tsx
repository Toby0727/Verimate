import { OnboardingStep } from "@/components/onboarding/onboarding-step";
import { SchoolEmailForm } from "@/components/onboarding/school-email-form";

export default function VerifyPage() {
  return (
    <OnboardingStep step={2} title="Verify your school email" allowWhenDone>
      <SchoolEmailForm />
    </OnboardingStep>
  );
}
