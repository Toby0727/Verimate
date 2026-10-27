"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DemoSkeleton } from "@/components/demo/demo-skeleton";
import { ChoiceChips } from "@/components/shell/choice-chips";
import { formatDay } from "@/components/shell/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as actions from "@/lib/demo/actions";
import {
  accountOf,
  foundingContext,
  subletOf,
  verifiedCount,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/use-demo";
import { FOUNDING_SEATS, REPORT_SLA_HOURS } from "@/lib/rules/constants";
import { foundingSeatsUsed } from "@/lib/rules/membership";
import type { Building, Report } from "@/lib/rules/types";

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
      {children}
    </p>
  );
}

function hoursLeft(createdAt: string, now: Date) {
  const left =
    REPORT_SLA_HOURS -
    (now.getTime() - new Date(createdAt).getTime()) / 3_600_000;
  return left > 0 ? `Due in ${Math.ceil(left)}h` : "Overdue";
}

export function AdminOverview() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const { world } = demo;
  const ctx = foundingContext(world);
  const cards = [
    {
      label: "Admissions to review",
      value: world.verifications.filter((v) => v.status === "pending").length,
      href: "/admin/admissions",
    },
    {
      label: "Leases to review",
      value: world.sublets.filter((s) => s.lease.status === "pending").length,
      href: "/admin/leases",
    },
    {
      label: "Open reports",
      value: world.reports.filter((r) => r.status === "open").length,
      href: "/admin/reports",
    },
    {
      label: "Founding spots used",
      value: `${foundingSeatsUsed(world, ctx)} / ${FOUNDING_SEATS}`,
      href: "/admin/founding",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="rounded-xl border p-4 hover:bg-muted"
        >
          <p className="font-semibold text-2xl">{c.value}</p>
          <p className="text-muted-foreground text-sm">{c.label}</p>
        </Link>
      ))}
    </div>
  );
}

export function AdmissionsQueue() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const { world } = demo;
  const pending = world.verifications.filter((v) => v.status === "pending");
  const reviewed = world.verifications.filter(
    (v) =>
      v.type === "admitted" &&
      v.status !== "pending" &&
      v.documentName === null,
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-lg">Admission documents</h1>
      {pending.length === 0 ? <Empty>No admissions waiting.</Empty> : null}
      {pending.map((v) => (
        <div key={v.id} className="flex flex-col gap-2 rounded-xl border p-3">
          <p className="font-medium">
            {accountOf(world, v.accountId)?.displayName}
          </p>
          <p className="text-muted-foreground text-sm">
            {v.documentName} · submitted {formatDay(v.submittedAt)}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                actions.reviewVerification(v.id, "approved").ok &&
                toast.success(
                  "Approved. Document deleted — only the result is kept.",
                )
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                actions.reviewVerification(v.id, "rejected").ok &&
                toast.success(
                  "Rejected. Document deleted — only the result is kept.",
                )
              }
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
      {reviewed.length > 0 ? (
        <section className="flex flex-col gap-1">
          <h2 className="font-medium text-muted-foreground text-sm">
            Reviewed
          </h2>
          {reviewed.map((v) => (
            <p key={v.id} className="text-sm">
              {accountOf(world, v.accountId)?.displayName} — {v.status} ·
              Document deleted, only the result is kept
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function LeasesQueue() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const pending = demo.world.sublets.filter(
    (s) => s.lease.status === "pending",
  );

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-lg">Leases</h1>
      {pending.length === 0 ? <Empty>No leases waiting.</Empty> : null}
      {pending.map((s) => (
        <div key={s.id} className="flex flex-col gap-2 rounded-xl border p-3">
          <Link
            href={`/sublets/${s.id}`}
            className="font-medium hover:underline"
          >
            {s.title}
          </Link>
          <p className="text-muted-foreground text-sm">
            {accountOf(demo.world, s.authorId)?.displayName} ·{" "}
            {s.lease.documentName}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                actions.reviewLease(s.id, "verified").ok &&
                toast.success("Lease verified. Document deleted.")
              }
            >
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                actions.reviewLease(s.id, "rejected").ok &&
                toast.success("Lease rejected. Document deleted.")
              }
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

const RESOLUTIONS: {
  value: NonNullable<Report["resolution"]>;
  label: string;
}[] = [
  { value: "removed", label: "Remove post" },
  { value: "warned", label: "Warn" },
  { value: "banned", label: "Ban" },
  { value: "dismissed", label: "Dismiss" },
];

export function ReportsQueue() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const { world, now } = demo;
  const open = world.reports.filter((r) => r.status === "open");
  const resolved = world.reports.filter((r) => r.status === "resolved");

  const describe = (r: Report) => {
    if (r.target.type === "sublet") {
      const s = subletOf(world, r.target.id);
      return {
        label: `Sublet: ${s?.title ?? "deleted"}`,
        href: `/sublets/${r.target.id}`,
      };
    }
    return {
      label: `Account: ${accountOf(world, r.target.id)?.displayName ?? "deleted"}`,
      href: `/roommates/${r.target.id}`,
    };
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-lg">Reports</h1>
      {open.length === 0 ? <Empty>No open reports.</Empty> : null}
      {open.map((r) => {
        const target = describe(r);
        return (
          <div key={r.id} className="flex flex-col gap-2 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <Link href={target.href} className="font-medium hover:underline">
                {target.label}
              </Link>
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 text-xs">
                {hoursLeft(r.createdAt, now)}
              </span>
            </div>
            <p className="text-sm">
              <span className="font-medium">{r.reason}</span>
              {r.note ? ` — ${r.note}` : ""}
            </p>
            <p className="text-muted-foreground text-xs">
              From {accountOf(world, r.reporterId)?.displayName} ·{" "}
              {formatDay(r.createdAt)}
            </p>
            <div className="flex flex-wrap gap-2">
              {RESOLUTIONS.filter(
                (o) => o.value !== "removed" || r.target.type === "sublet",
              ).map((o) => (
                <Button
                  key={o.value}
                  size="sm"
                  variant={o.value === "banned" ? "destructive" : "outline"}
                  onClick={() =>
                    actions.resolveReport(r.id, o.value).ok &&
                    toast.success(`Report resolved: ${o.label}.`)
                  }
                >
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
      {resolved.length > 0 ? (
        <section className="flex flex-col gap-1">
          <h2 className="font-medium text-muted-foreground text-sm">
            Resolved
          </h2>
          {resolved.map((r) => (
            <p key={r.id} className="text-sm">
              {describe(r).label} — {r.resolution}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function BuildingsAdmin() {
  const demo = useDemo();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Building["kind"]>("building");
  if (!demo) return <DemoSkeleton />;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-lg">Buildings and areas</h1>
      <form
        className="flex flex-col gap-2 rounded-xl border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (actions.addBuilding(name, kind).ok) {
            setName("");
            toast.success("Added.");
          }
        }}
      >
        <Input
          aria-label="Name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ChoiceChips
          label="Kind"
          options={[
            { value: "building", label: "Building" },
            { value: "area", label: "Area" },
          ]}
          value={kind}
          onChange={setKind}
        />
        <Button
          type="submit"
          size="sm"
          className="self-start"
          disabled={!name.trim()}
        >
          Add
        </Button>
      </form>
      <ul className="flex flex-col divide-y rounded-xl border">
        {demo.world.buildings.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-2 p-3 text-sm"
          >
            <span
              className={b.active ? "" : "text-muted-foreground line-through"}
            >
              {b.name}{" "}
              <span className="text-muted-foreground text-xs">({b.kind})</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => actions.toggleBuilding(b.id)}
            >
              {b.active ? "Deactivate" : "Activate"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FoundingAdmin() {
  const demo = useDemo();
  if (!demo) return <DemoSkeleton />;
  const { world } = demo;
  const ctx = foundingContext(world);
  const founders = world.memberships.filter((m) => m.kind === "founding");

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold text-lg">Founding members</h1>
      <div className="rounded-xl border p-4">
        <p className="font-semibold text-2xl">
          {foundingSeatsUsed(world, ctx)} / {FOUNDING_SEATS}
        </p>
        <p className="text-muted-foreground text-sm">
          Spots used ({world.foundingSeatsTakenElsewhere} outside the sample
          set) · {verifiedCount(world)} verified students ·{" "}
          {ctx.thresholdReached
            ? "invites open"
            : "invites open at 50 verified"}
        </p>
      </div>
      <ul className="flex flex-col divide-y rounded-xl border">
        {founders.map((m) => (
          <li key={m.accountId} className="flex justify-between p-3 text-sm">
            {accountOf(world, m.accountId)?.displayName}
            <span className="text-muted-foreground">
              since {formatDay(m.startedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
