import { GoogleFinish } from "@/components/onboarding/google-finish";
import { SimplePage } from "@/components/shell/simple-page";

export default function AuthFinishPage() {
  return (
    <SimplePage title="Signing in">
      <GoogleFinish />
    </SimplePage>
  );
}
