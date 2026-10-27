import { AdmittedUpload } from "@/components/onboarding/admitted-upload";
import { OnboardingStep } from "@/components/onboarding/onboarding-step";

export default function AdmittedPage() {
  return (
    <OnboardingStep step={2} title="Verify your admission">
      <AdmittedUpload />
    </OnboardingStep>
  );
}
