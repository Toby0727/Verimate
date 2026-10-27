"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as actions from "@/lib/demo/actions";
import { FieldError } from "./onboarding-step";

export function AdmittedUpload() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const result = actions.submitAdmittedDocument(fileName);
        if (!result.ok) return setError("Choose your admission letter first.");
        showSampleNotice(
          "the file is not uploaded; the team sees only its name",
        );
        router.push("/onboarding/profile");
      }}
    >
      <p className="text-muted-foreground text-sm">
        Upload your admission letter or enrollment confirmation. The team
        reviews it within 48 hours and deletes the file afterwards — only the
        result is kept. Once you start classes, verify your school email too.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admission">Admission document</Label>
        <input
          id="admission"
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          className="text-sm file:mr-3 file:rounded-md file:border file:bg-muted file:px-3 file:py-1.5"
        />
        <button
          type="button"
          className="self-start text-primary text-sm underline-offset-4 hover:underline"
          onClick={() => setFileName("sample-admission-letter.pdf")}
        >
          Use a sample file instead
        </button>
        {fileName ? (
          <p className="flex items-center gap-2 text-sm">
            <FileText className="size-4" /> {fileName}
          </p>
        ) : null}
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" size="lg">
        Submit for review
      </Button>
      <p className="text-muted-foreground text-xs">
        Sample: the file is not uploaded anywhere.
      </p>
    </form>
  );
}
