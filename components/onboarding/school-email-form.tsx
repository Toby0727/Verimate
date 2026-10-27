"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import { isEmailTaken, isSchoolEmail } from "@/lib/rules/verification";
import { FieldError } from "./onboarding-step";

const ERRORS = {
  "not-school": "Use your @syr.edu or @esf.edu email.",
  taken:
    "This school email is already linked to another account. One school email can belong to one account only.",
  "wrong-code": "That code isn't right. In this demo the code is 123456.",
} as const;

export function SchoolEmailForm() {
  const router = useRouter();
  const demo = useDemo();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const reverify = demo?.me?.onboardingStep === "done";

  function sendCode() {
    if (!isSchoolEmail(email)) return setError(ERRORS["not-school"]);
    if (
      demo &&
      isEmailTaken(email, demo.world.verifications, demo.meId ?? undefined)
    ) {
      return setError(ERRORS.taken);
    }
    setError("");
    setSent(true);
    showSampleNotice(
      `a code would be emailed to ${email} — use ${actions.SAMPLE_CODE}`,
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!sent) return sendCode();
        const result = actions.verifySchoolEmail(email, code);
        if (!result.ok) return setError(ERRORS[result.reason]);
        router.push(
          reverify ? (demo?.world.returnTo ?? "/me") : "/onboarding/profile",
        );
      }}
    >
      <p className="text-muted-foreground text-sm">
        {reverify
          ? "Verification lasts 12 months. Confirm your school email again to keep your verified badge."
          : "We only use your school email to confirm you're a student. You'll keep signing in with Google."}
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="school-email">School email</Label>
        <Input
          id="school-email"
          type="email"
          inputMode="email"
          placeholder="you@syr.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSent(false);
          }}
        />
      </div>
      {sent ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            Sample: no email is sent. The code is {actions.SAMPLE_CODE}.
          </p>
        </div>
      ) : null}
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg">
        {sent ? "Verify" : "Send code"}
      </Button>
    </form>
  );
}
