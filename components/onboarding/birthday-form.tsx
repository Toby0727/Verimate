"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as actions from "@/lib/demo/actions";
import { FieldError } from "./onboarding-step";

export function BirthdayForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const result = actions.submitBirthday(date);
        if (result.ok) {
          router.push("/onboarding/path");
        } else {
          setError(
            result.reason === "missing"
              ? "Enter your date of birth."
              : "You need to be 18 or older, or 17 and an admitted SU/ESF student.",
          );
        }
      }}
    >
      <p className="text-muted-foreground text-sm">
        Verimate is for adults. Admitted students who are 17 can join after we
        verify their admission.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="birthday">Date of birth</Label>
        <Input
          id="birthday"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg">
        Continue
      </Button>
    </form>
  );
}
