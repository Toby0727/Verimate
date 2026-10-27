"use client";

// Sample data — delete when the flows are replaced with real functionality.
import { useSyncExternalStore } from "react";
import { entitlements } from "@/lib/rules/membership";
import * as actions from "./actions";
import { personaById } from "./personas";
import {
  accountOf,
  currentAccountId,
  membershipOf,
  profileOf,
  verificationOf,
} from "./selectors";
import { getServerSnapshot, getSnapshot, subscribe } from "./store";

// Returns null until the sample world has loaded in the browser.
export function useDemo() {
  const world = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!world) return null;

  const now = new Date();
  const persona = personaById(world.currentPersonaId);
  const meId = currentAccountId(world);
  const membership = membershipOf(world, meId);
  const perks = entitlements(membership, world.viewAsFree);

  return {
    world,
    now,
    persona,
    meId,
    me: accountOf(world, meId),
    profile: profileOf(world, meId),
    verification: verificationOf(world, meId),
    membership,
    entitlements: perks,
    isMember: perks.size > 0,
    actions,
  };
}

export type Demo = NonNullable<ReturnType<typeof useDemo>>;
