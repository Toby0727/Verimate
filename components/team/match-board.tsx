"use client";

import { TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { displayName, type TeamRow } from "@/lib/rules/team";
import {
  busiestTerm,
  type RoommateMatch,
  roommateMatches,
  type SubletFit,
  type SubletMatch,
  subletMatches,
  termDemand,
} from "@/lib/rules/team-matches";
import { cn } from "@/lib/utils";
import { TERMS, type Term } from "@/lib/waitlist/options";

// Two series, checked with the dataviz palette validator (light surface):
// deep rust for people offering a place, brand orange for people who need
// one. Orange is under 3:1 on white, so every bar carries its number.
const OFFER = "#8a3a12";
const NEED = "#f8672e";

const TERM_LABEL = Object.fromEntries(
  TERMS.map((t) => [t.value, t.label]),
) as Record<Term, string>;

const FIT_TEXT: Record<SubletFit, string> = {
  area: "Their place is in an area they want",
  unknown: "We don't know where their place is",
  elsewhere: "Their place is in another area",
};

const ROOMMATES_SHOWN = 8;

// Who could help whom: sublet supply and demand per term, then for one term
// the people who need a sublet linked to the people subletting out, and
// the best roommate pairs. Tapping a name opens their answers below.
export function MatchBoard({
  rows,
  onPick,
}: {
  rows: TeamRow[];
  onPick: (userId: string) => void;
}) {
  const people = useMemo(() => rows.filter((r) => r.has_response), [rows]);
  const demand = useMemo(() => termDemand(people), [people]);
  const [term, setTerm] = useState<Term>(() => busiestTerm(people));
  const sublets = useMemo(() => subletMatches(people, term), [people, term]);
  const roommates = useMemo(
    () => roommateMatches(people, term),
    [people, term],
  );
  const byId = useMemo(
    () => new Map(people.map((r) => [r.user_id, r])),
    [people],
  );
  const name = (id: string) => {
    const row = byId.get(id);
    return row ? displayName(row) : "Unknown";
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-4">
      <div>
        <h2 className="font-semibold text-[15px]">Matches</h2>
        <p className="text-[12px] text-faint">
          Who could help whom, from the survey answers. Tap a name to open their
          answers below.
        </p>
      </div>

      <DemandChart demand={demand} term={term} onTerm={setTerm} />

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Term">
        {TERMS.map((t) => {
          const n =
            subletMatches(people, t.value).length +
            roommateMatches(people, t.value).length;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={term === t.value}
              onClick={() => setTerm(t.value)}
              className={cn(
                "rounded-full px-3 py-1.5 font-medium text-[13px] transition-colors",
                term === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-primary-tint",
              )}
            >
              {t.label}{" "}
              <span className={term === t.value ? "opacity-70" : "text-faint"}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <SubletBoard
          term={term}
          rows={people}
          matches={sublets}
          name={name}
          onPick={onPick}
        />
        <RoommatePairs
          term={term}
          matches={roommates}
          name={name}
          onPick={onPick}
        />
      </div>
    </section>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-[3px]"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// Per term: how many are subletting out vs. need a sublet (paired bars on
// one axis), with roommate seekers as a number beside them.
function DemandChart({
  demand,
  term,
  onTerm,
}: {
  demand: ReturnType<typeof termDemand>;
  term: Term;
  onTerm: (term: Term) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...demand.flatMap((d) => [d.offering, d.seeking]));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium text-[13px]">Sublets by term</h3>
        <Legend
          items={[
            { color: OFFER, label: "Subletting their place out" },
            { color: NEED, label: "Need a sublet" },
          ]}
        />
      </div>
      <ul className="flex flex-col gap-2.5">
        {demand.map((d) => (
          <li key={d.term} className="relative">
            {hover === d.term ? (
              <span className="pointer-events-none absolute bottom-full left-28 z-10 mb-1 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[12px] text-primary-foreground shadow-md">
                <span className="block font-semibold">
                  {TERM_LABEL[d.term]}
                </span>
                {d.offering} subletting out · {d.seeking} need a sublet
                <br />
                {d.roommates} looking for roommates
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onTerm(d.term)}
              onMouseEnter={() => setHover(d.term)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.term)}
              onBlur={() => setHover(null)}
              className={cn(
                "grid w-full grid-cols-[6.5rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors",
                term === d.term ? "bg-muted" : "hover:bg-muted/60",
              )}
              aria-label={`${TERM_LABEL[d.term]}: ${d.offering} subletting out, ${d.seeking} need a sublet, ${d.roommates} looking for roommates`}
            >
              <span className="font-medium">{TERM_LABEL[d.term]}</span>
              <span className="flex flex-col gap-[2px]">
                {(
                  [
                    ["offer", d.offering, OFFER],
                    ["need", d.seeking, NEED],
                  ] as const
                ).map(([key, value, color]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 rounded-r-[4px]"
                      style={{
                        width: value ? `${(value / max) * 85}%` : "2px",
                        background: value ? color : "var(--muted)",
                        opacity: hover && hover !== d.term ? 0.45 : 1,
                      }}
                    />
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {value}
                    </span>
                  </span>
                ))}
              </span>
              <span className="text-right text-[12px] text-muted-foreground tabular-nums">
                {d.roommates} want roommates
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ROW = 40; // px per name in the sublet board
const FIT_STROKE: Record<SubletFit, { color: string; dash?: string }> = {
  area: { color: NEED },
  unknown: { color: "#8a8a93", dash: "5 4" },
  elsewhere: { color: "#c4c4ca", dash: "1.5 4" },
};

// People who need a sublet (left) linked to people subletting out (right),
// one line per possible match. Tap a name to show only their lines.
function SubletBoard({
  term,
  rows,
  matches,
  name,
  onPick,
}: {
  term: Term;
  rows: TeamRow[];
  matches: SubletMatch[];
  name: (id: string) => string;
  onPick: (id: string) => void;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const seekers = rows.filter((r) => r.sublet_in_terms?.includes(term));
  const offerers = rows.filter((r) => r.sublet_out_terms?.includes(term));
  const height = Math.max(seekers.length, offerers.length, 1) * ROW;
  const y = (list: TeamRow[], id: string) =>
    list.findIndex((r) => r.user_id === id) * ROW + ROW / 2;
  const lit = (m: SubletMatch) =>
    !focus || m.seekerId === focus || m.offererId === focus;

  const person = (row: TeamRow, side: "left" | "right") => {
    const id = row.user_id;
    const count = matches.filter((m) =>
      side === "left" ? m.seekerId === id : m.offererId === id,
    ).length;
    return (
      <li key={id} style={{ height: ROW }} className="flex items-center">
        <button
          type="button"
          onClick={() => setFocus(focus === id ? null : id)}
          aria-pressed={focus === id}
          className={cn(
            "flex w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
            side === "right" && "flex-row-reverse text-right",
            focus === id
              ? "border-foreground bg-foreground text-background"
              : "border-black/10 bg-background hover:bg-muted",
          )}
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: side === "left" ? NEED : OFFER }}
          />
          <span className="min-w-0 flex-1 truncate">{displayName(row)}</span>
          <span className="shrink-0 tabular-nums opacity-60">{count}</span>
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/5 p-3">
      <div>
        <h3 className="font-medium text-[13px]">
          Sublets · {TERM_LABEL[term]}
        </h3>
        <p className="text-[12px] text-faint">
          {seekers.length} need a place, {offerers.length} subletting out. Tap a
          name to see only their matches.
        </p>
      </div>
      {seekers.length && offerers.length ? (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_minmax(3rem,0.8fr)_minmax(0,1fr)] text-[11px] text-muted-foreground">
            <span>Need a sublet</span>
            <span />
            <span className="text-right">Subletting out</span>
          </div>
          <div className="-mt-2 grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_minmax(3rem,0.8fr)_minmax(0,1fr)]">
            <ul style={{ height }}>{seekers.map((r) => person(r, "left"))}</ul>
            <svg
              aria-hidden="true"
              width="100%"
              height={height}
              viewBox={`0 0 100 ${height}`}
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {matches.map((m) => {
                const y1 = y(seekers, m.seekerId);
                const y2 = y(offerers, m.offererId);
                const stroke = FIT_STROKE[m.fit];
                return (
                  <path
                    key={`${m.seekerId}-${m.offererId}`}
                    d={`M0 ${y1} C50 ${y1} 50 ${y2} 100 ${y2}`}
                    fill="none"
                    stroke={stroke.color}
                    strokeDasharray={stroke.dash}
                    strokeWidth={lit(m) ? 2 : 1}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={lit(m) ? 1 : 0.15}
                  />
                );
              })}
            </svg>
            <ul style={{ height }}>
              {offerers.map((r) => person(r, "right"))}
            </ul>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            {(Object.keys(FIT_STROKE) as SubletFit[]).map((fit) => (
              <li key={fit} className="inline-flex items-center gap-1.5">
                <svg width="22" height="6" aria-hidden="true">
                  <line
                    x1="1"
                    y1="3"
                    x2="21"
                    y2="3"
                    stroke={FIT_STROKE[fit].color}
                    strokeDasharray={FIT_STROKE[fit].dash}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {FIT_TEXT[fit]}
              </li>
            ))}
          </ul>
          <details className="text-[12px]">
            <summary className="cursor-pointer text-muted-foreground">
              All {matches.length} pairs as a list
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {matches.map((m) => (
                <li
                  key={`${m.seekerId}-${m.offererId}`}
                  className={cn(!lit(m) && "opacity-40")}
                >
                  <NameLink id={m.seekerId} name={name} onPick={onPick} /> ←{" "}
                  <NameLink id={m.offererId} name={name} onPick={onPick} />
                  <span className="text-faint"> · {FIT_TEXT[m.fit]}</span>
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          {seekers.length || offerers.length
            ? `Only one side so far: ${seekers.length} need a place, ${offerers.length} subletting out.`
            : "Nobody needs or offers a sublet this term yet."}
        </p>
      )}
    </div>
  );
}

function NameLink({
  id,
  name,
  onPick,
}: {
  id: string;
  name: (id: string) => string;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className="font-medium underline decoration-black/20 underline-offset-2 hover:decoration-foreground"
    >
      {name(id)}
    </button>
  );
}

// Best roommate pairs for the term: a score bar (one series) and why.
function RoommatePairs({
  term,
  matches,
  name,
  onPick,
}: {
  term: Term;
  matches: RoommateMatch[];
  name: (id: string) => string;
  onPick: (id: string) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? matches : matches.slice(0, ROOMMATES_SHOWN);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/5 p-3">
      <div>
        <h3 className="font-medium text-[13px]">
          Roommate pairs · {TERM_LABEL[term]}
        </h3>
        <p className="text-[12px] text-faint">
          Both looking this term, with overlapping budget and area. Score is how
          alike they live (sleep, tidiness, guests, drinking, weed, smoking,
          pets) plus shared hobbies.
        </p>
      </div>
      {matches.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No pairs this term yet.
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {shown.map((m) => (
            <li
              key={`${m.aId}-${m.bId}`}
              className="flex flex-col gap-1.5 py-2.5"
            >
              <div className="flex items-center gap-3 text-[13px]">
                <span className="min-w-0 flex-1 truncate">
                  <NameLink id={m.aId} name={name} onPick={onPick} />
                  {" + "}
                  <NameLink id={m.bId} name={name} onPick={onPick} />
                </span>
                <span className="h-2 w-20 shrink-0 rounded-r-[4px] bg-muted">
                  <span
                    className="block h-full rounded-r-[4px] bg-foreground/75"
                    style={{ width: `${m.score}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right font-semibold tabular-nums">
                  {m.score}
                </span>
              </div>
              {m.reasons.length || m.clashes.length ? (
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {m.reasons.map((r) => (
                    <span key={r} className="rounded-full bg-muted px-2 py-0.5">
                      {r}
                    </span>
                  ))}
                  {m.clashes.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-verified-tint px-2 py-0.5 font-medium text-verified"
                    >
                      <TriangleAlert className="size-3" aria-hidden />
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
      {matches.length > ROOMMATES_SHOWN ? (
        <button
          type="button"
          onClick={() => setAll(!all)}
          className="self-start text-[12px] text-muted-foreground underline underline-offset-2"
        >
          {all ? "Show fewer" : `Show all ${matches.length}`}
        </button>
      ) : null}
    </div>
  );
}
