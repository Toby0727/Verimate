"use client";

import { ChevronDown, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SampleBadge } from "@/components/demo/sample-badge";
import { showSampleNotice } from "@/components/demo/sample-notice";
import { Button } from "@/components/ui/button";
import * as actions from "@/lib/demo/actions";
import { PERSONAS } from "@/lib/demo/personas";
import type { PersonaId } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.35ZM12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.59-4.1H3.07v2.58A10 10 0 0 0 12 22Zm-5.59-8.07a6 6 0 0 1 0-3.86V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.58ZM12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.58C7.2 7.73 9.4 5.98 12 5.98Z"
      />
    </svg>
  );
}

function routeFor(id: PersonaId) {
  if (id === "new-user") return "/onboarding/birthday";
  if (id === "admin") return "/admin";
  return "/roommates";
}

export function SignInCard() {
  const router = useRouter();
  const [showPersonas, setShowPersonas] = useState(false);

  // Every sign-in method is a sample: each starts a brand-new user.
  function startSample(method: string) {
    actions.startNewUser();
    if (method !== "Google") showSampleNotice(`no ${method} code is sent.`);
    router.push("/onboarding/birthday");
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[20px] tracking-tight">
              Verimate
            </span>
            <SampleBadge />
          </div>
          <h2 className="font-semibold text-[22px] leading-tight tracking-tight">
            Sign in to keep browsing
          </h2>
          <p className="text-[14px] text-muted-foreground">
            Only verified Syracuse University and SUNY ESF students. You'll
            verify your school email next.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => startSample("Google")}>
            <GoogleMark />
            Continue with Google
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => startSample("SMS")}
          >
            <Smartphone />
            Continue with phone
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => startSample("email")}
          >
            <Mail />
            Continue with email
          </Button>
        </div>

        <p className="text-center text-[12px] text-faint">
          By continuing you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div className="rounded-2xl bg-card">
        <button
          type="button"
          aria-expanded={showPersonas}
          onClick={() => setShowPersonas((v) => !v)}
          className="flex w-full items-center gap-2 px-5 py-3.5 text-left"
        >
          <span className="flex-1">
            <span className="block font-semibold text-[14px]">
              Demo identities
            </span>
            <span className="block text-[12px] text-muted-foreground">
              Skip sign-in and jump in as a sample user
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              showPersonas && "rotate-180",
            )}
          />
        </button>
        {showPersonas ? (
          <ul className="flex flex-col border-t px-2 py-2">
            {PERSONAS.map((persona) => (
              <li key={persona.id}>
                <button
                  type="button"
                  onClick={() => {
                    actions.switchPersona(persona.id);
                    router.push(routeFor(persona.id));
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-muted"
                >
                  <span className="block font-medium text-[14px]">
                    {persona.label}
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    {persona.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
