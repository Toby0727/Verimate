"use client";

import type { Building } from "@/lib/rules/types";

export const OTHER_BUILDING = "other";

// Team-maintained buildings and areas, with "Other" at the end.
export function BuildingPicker({
  buildings,
  value,
  onChange,
}: {
  buildings: Building[];
  value: string | null;
  onChange: (buildingId: string | null) => void;
}) {
  return (
    <select
      aria-label="Building or area"
      className="h-9 rounded-lg border bg-background px-2 text-sm"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Not set</option>
      {buildings
        .filter((b) => b.active)
        .map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
            {b.kind === "area" ? " (area)" : ""}
          </option>
        ))}
      <option value={OTHER_BUILDING}>Other</option>
    </select>
  );
}
