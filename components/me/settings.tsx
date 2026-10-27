"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { AccessGate } from "@/components/shell/access-gate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as actions from "@/lib/demo/actions";
import { buildingOf } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";

function SettingsContent() {
  const demo = useDemo();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!demo?.me) return <DemoSkeleton />;
  const { me, profile, world } = demo;
  const building = buildingOf(world, profile?.buildingId ?? null);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 text-sm">
        <span>
          <span className="font-medium">Email notifications</span>
          <span className="block text-muted-foreground text-xs">
            New requests and accepted requests, sent to {me.googleEmail}.
          </span>
        </span>
        <Switch
          aria-label="Email notifications"
          checked={me.emailNotifications}
          onCheckedChange={(c) => actions.setEmailNotifications(c)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 text-sm">
        <span>
          <span className="font-medium">Show me in my building's list</span>
          <span className="block text-muted-foreground text-xs">
            {building
              ? `Only verified students can see who lives in ${building.name}. Off by default.`
              : "Choose your building in Edit profile first."}
          </span>
        </span>
        <Switch
          aria-label="Show me in my building's list"
          checked={profile?.showInBuilding ?? false}
          disabled={!building}
          onCheckedChange={(c) => actions.setShowInBuilding(c)}
        />
      </div>

      <div className="flex gap-4 text-sm">
        <Link href="/terms" className="text-primary">
          Terms
        </Link>
        <Link href="/privacy" className="text-primary">
          Privacy policy
        </Link>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 p-3 text-sm">
        <span className="font-medium">Delete account</span>
        <span className="text-muted-foreground text-xs">
          Removes your profile, posts and chats. This can't be undone.
        </span>
        {confirmDelete ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                actions.deleteAccount();
                router.push("/");
              }}
            >
              Yes, delete everything
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            className="self-start"
            onClick={() => setConfirmDelete(true)}
          >
            Delete account
          </Button>
        )}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <AccessGate require="signed-in">
      <SettingsContent />
    </AccessGate>
  );
}
