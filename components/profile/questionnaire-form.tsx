"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { AccessGate } from "@/components/shell/access-gate";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { QUESTIONS } from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as actions from "@/lib/demo/actions";
import { useDemo } from "@/lib/demo/use-demo";
import type { Questionnaire } from "@/lib/rules/types";

function QuestionnaireContent() {
  const demo = useDemo();
  const router = useRouter();
  const [answers, setAnswers] = useState<Partial<Questionnaire>>(
    demo?.profile?.questionnaire ?? {},
  );
  const [consent, setConsent] = useState(
    demo?.profile?.aiMatchConsent ?? false,
  );
  const [error, setError] = useState("");
  if (!demo) return <DemoSkeleton />;

  return (
    <form
      className="flex flex-col gap-5 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (QUESTIONS.some((q) => !answers[q.key]))
          return setError("Answer every question to save.");
        actions.saveQuestionnaire(answers as Questionnaire, consent);
        toast.success("Questionnaire saved.");
        router.push("/me");
      }}
    >
      <p className="text-muted-foreground text-sm">
        More detail helps people decide, and powers AI matching if you allow it.
      </p>
      {QUESTIONS.map((q) => (
        <div key={q.key} className="flex flex-col gap-2">
          <span className="font-medium text-sm">{q.label}</span>
          <ChoiceChips
            label={q.label}
            options={q.options}
            value={answers[q.key] ?? null}
            onChange={(value) => setAnswers((a) => ({ ...a, [q.key]: value }))}
          />
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
        <span>
          <span className="font-medium">
            Allow Verimate to use this for AI matching
          </span>
          <span className="block text-muted-foreground text-xs">
            Only your questionnaire and bio are used. You can turn this off any
            time.
          </span>
        </span>
        <Switch
          aria-label="Allow AI matching"
          checked={consent}
          onCheckedChange={setConsent}
        />
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg">
        Save
      </Button>
    </form>
  );
}

export function QuestionnaireForm() {
  return (
    <AccessGate require="signed-in">
      <QuestionnaireContent />
    </AccessGate>
  );
}
