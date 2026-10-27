import { OnboardingStep } from "@/components/onboarding/onboarding-step";
import { PathChooser } from "@/components/onboarding/path-chooser";

export default function PathPage() {
  return (
    <OnboardingStep step={1} title="How will you verify?">
      <PathChooser />
    </OnboardingStep>
  );
}
