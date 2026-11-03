"use client";

import { useState } from "react";
import { type FloorPlan, leaseTotal, plansInAreas } from "@/lib/rules/listings";
import {
  FLOOR_PLANS,
  LISTINGS_AS_OF,
  LISTINGS_ENABLED,
} from "@/lib/waitlist/listings";
import { AREAS, type Area } from "@/lib/waitlist/options";

const PLANS_SHOWN = 3;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const BASIS: Record<FloorPlan["basis"], string> = {
  "per-bed": "per person",
  "per-unit": "whole unit",
  unclear: "",
};

// Places and floor plans in the areas the student picked on the map, so they
// can see what living there costs over a whole lease.
export function AreaListings({ areas }: { areas: Area[] | null }) {
  const groups = LISTINGS_ENABLED ? plansInAreas(FLOOR_PLANS, areas) : [];
  if (groups.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-[15px]">Places in your areas</h3>
      {groups.map((group) => (
        <Property
          key={group.property}
          name={group.property}
          area={AREAS.find((a) => a.value === group.area)?.label ?? ""}
          plans={group.plans}
        />
      ))}
      <p className="text-[12px] text-muted-foreground">
        Lowest listed rent from each place's public listing, {LISTINGS_AS_OF}.
        Prices change often and may not include fees; check with the property.
      </p>
    </section>
  );
}

function Property({
  name,
  area,
  plans,
}: {
  name: string;
  area: string;
  plans: FloorPlan[];
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? plans : plans.slice(0, PLANS_SHOWN);
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <a
          href={plans[0].source}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[15px] underline-offset-2 hover:underline"
        >
          {name}
        </a>
        <span className="shrink-0 text-[12px] text-muted-foreground">
          {area}
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {shown.map((plan) => (
          <Plan key={`${plan.plan}-${plan.monthly}`} plan={plan} />
        ))}
      </ul>
      {plans.length > PLANS_SHOWN && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="self-start text-[13px] underline underline-offset-2"
        >
          {open ? "Show less" : `Show ${plans.length - PLANS_SHOWN} more`}
        </button>
      )}
    </div>
  );
}

function Plan({ plan }: { plan: FloorPlan }) {
  const basis = BASIS[plan.basis];
  const total = leaseTotal(plan);
  const layout = [
    plan.beds === 0 ? "Studio" : `${plan.beds} bed`,
    plan.baths !== null && `${plan.baths} bath`,
    plan.sqft !== null && `${plan.sqft} sqft`,
  ].filter(Boolean);
  return (
    <li className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col">
        <span className="text-[14px]">{layout.join(" · ")}</span>
        {plan.note && (
          <span className="text-[12px] text-muted-foreground">{plan.note}</span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end text-right">
        <span className="font-semibold text-[14px]">
          {money.format(plan.monthly)}/mo
          {basis && (
            <span className="font-normal text-muted-foreground"> {basis}</span>
          )}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {total === null
            ? "Lease length not listed"
            : `${plan.leaseMonths} mo · ${money.format(total)} total`}
        </span>
      </div>
    </li>
  );
}
