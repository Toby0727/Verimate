import { SampleBadge } from "@/components/demo/sample-badge";
import { SimplePage } from "@/components/shell/simple-page";

export default function PrivacyPage() {
  return (
    <SimplePage title="Privacy policy" backHref="/">
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        Draft for the demo, not legal advice <SampleBadge />
      </p>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          Your school email is used only to verify that you're a student. You
          sign in with Google, and notifications go to that address. You can
          turn them off in Settings.
        </p>
        <p>
          Admission letters and leases are deleted as soon as the team has
          reviewed them. Only the result (approved or not) is kept.
        </p>
        <p>
          Your building is never shown unless you turn on “Show me in my
          building's list”, and even then only verified students see it. Exact
          sublet addresses are shown only to people you've connected with.
        </p>
        <p>
          AI matching uses only your questionnaire and bio, and only if you
          allow it. You can delete your account at any time, which removes your
          profile, posts and chats.
        </p>
      </div>
    </SimplePage>
  );
}
