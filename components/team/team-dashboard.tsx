"use client";

import {
  BadgeCheck,
  CircleCheck,
  Gift,
  Loader2,
  LogIn,
  PenLine,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import {
  signInWithGoogle,
  signOutOfGoogle,
} from "@/components/onboarding/google-sign-in";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type Activity,
  answersOf,
  type DayCount,
  dailyCounts,
  displayName,
  isSchoolEmail,
  matchesSearch,
  recentActivity,
  referrerOf,
  type SignupStatus,
  type SourceCount,
  signupStatus,
  sourceBreakdown,
  stepsDone,
  type TeamRow,
  teamRaffleEntries,
  teamRaffleWeight,
  teamTotals,
  winChance,
} from "@/lib/rules/team";
import { WAITLIST_STEPS } from "@/lib/rules/waitlist";
import {
  DeleteRefused,
  deleteTeamAccount,
  loadTeam,
  type TeamSession,
  teamPhotoUrls,
} from "@/lib/team/api";
import { cn } from "@/lib/utils";
import {
  ABROAD_PLACE_LABELS,
  AREAS,
  BUDGETS,
  CANNABIS,
  CLEANLINESS,
  DRINKING,
  GENDERS,
  GREEK_LIFE,
  GUESTS,
  PETS,
  SLEEP,
  SMOKING,
  STUDY_ABROAD,
  TERMS,
  YEARS,
} from "@/lib/waitlist/options";

const TEAM_PATH = "/team";
const TIME_ZONE = "America/New_York";
const REFRESH_MS = 60_000;
const CHART_DAYS = 14;

type View = { status: "loading" } | { status: "error" } | TeamSession;

// The team's private dashboard: every account that signed in, how far each
// got, their answers, photo, referrals and raffle standing. Access is decided
// by public.team_waitlist() in the database, not by this page.
export function TeamDashboard() {
  const [view, setView] = useState<View>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setView(await loadTeam());
    } catch (error) {
      console.error(error);
      setView({ status: "error" });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Keep the numbers live while the tab is open and visible.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const ready = view.status === "ready" ? view : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1120px] flex-col bg-background">
      <header className="flex items-center justify-between gap-3 px-4 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-auto" />
          <span className="rounded-full bg-card px-2.5 py-1 font-medium text-[12px] text-muted-foreground">
            Team
          </span>
        </div>
        {ready && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden truncate text-[13px] text-muted-foreground sm:inline">
              {ready.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={refreshing}
              aria-label="Refresh"
            >
              <RefreshCw className={cn(refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOutOfGoogle();
                setView({ status: "signed-out" });
              }}
            >
              Sign out
            </Button>
          </div>
        )}
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4">
        {view.status === "loading" ? (
          <Centered>
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </Centered>
        ) : view.status === "error" ? (
          <Notice title="Couldn't load the dashboard">
            <p>Check your connection and try again.</p>
            <Button className="mt-3" onClick={refresh}>
              Try again
            </Button>
          </Notice>
        ) : view.status === "signed-out" ? (
          <Notice title="Verimate team dashboard">
            <p>
              Sign in with your team Google account to see who has joined the
              waitlist.
            </p>
            <SignInButton label="Sign in with Google" />
          </Notice>
        ) : view.status === "forbidden" ? (
          <Notice title="This account doesn't have access">
            <p>
              You're signed in as{" "}
              <strong className="break-all text-foreground">
                {view.email}
              </strong>
              , which isn't on the team list.
            </p>
            <SignInButton label="Use a different Google account" signOutFirst />
          </Notice>
        ) : view.status === "not-set-up" ? (
          <Notice title="One setup step left">
            <p>
              The dashboard's database function isn't installed yet. Run{" "}
              <code className="rounded bg-muted px-1 text-[13px]">
                supabase/migrations/20261104030000_team_dashboard.sql
              </code>{" "}
              in Supabase → SQL Editor, then refresh.
            </p>
          </Notice>
        ) : (
          <Dashboard
            rows={view.rows}
            loadedAt={view.loadedAt}
            myEmail={view.email}
            onDeleted={(userId) =>
              setView((current) =>
                current.status === "ready"
                  ? {
                      ...current,
                      rows: current.rows.filter((r) => r.user_id !== userId),
                    }
                  : current,
              )
            }
          />
        )}
      </main>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center">{children}</div>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Centered>
      <div className="flex w-full max-w-[420px] flex-col gap-2 rounded-2xl bg-card p-6 text-[15px] text-muted-foreground">
        <h1 className="font-semibold text-[22px] text-foreground tracking-tight">
          {title}
        </h1>
        {children}
      </div>
    </Centered>
  );
}

function SignInButton({
  label,
  signOutFirst = false,
}: {
  label: string;
  signOutFirst?: boolean;
}) {
  const [redirecting, setRedirecting] = useState(false);
  return (
    <Button
      size="lg"
      className="mt-3"
      disabled={redirecting}
      onClick={async () => {
        setRedirecting(true);
        if (signOutFirst) await signOutOfGoogle();
        await signInWithGoogle(TEAM_PATH);
        // Only reached when the redirect to Google failed.
        setRedirecting(false);
      }}
    >
      {redirecting ? <Loader2 className="animate-spin" /> : <LogIn />}
      {label}
    </Button>
  );
}

type Filter = "all" | SignupStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "finished", label: "Finished" },
  { value: "in-progress", label: "In progress" },
  { value: "signed-in", label: "Signed in only" },
];

function Dashboard({
  rows,
  loadedAt,
  myEmail,
  onDeleted,
}: {
  rows: TeamRow[];
  loadedAt: Date;
  myEmail: string;
  onDeleted: (userId: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const totals = useMemo(
    () => teamTotals(rows, loadedAt, TIME_ZONE),
    [rows, loadedAt],
  );
  const days = useMemo(
    () => dailyCounts(rows, CHART_DAYS, loadedAt, TIME_ZONE),
    [rows, loadedAt],
  );
  const activity = useMemo(() => recentActivity(rows, 12), [rows]);
  const sources = useMemo(() => sourceBreakdown(rows), [rows]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: rows.length,
      finished: 0,
      "in-progress": 0,
      "signed-in": 0,
    };
    for (const row of rows) c[signupStatus(row)]++;
    return c;
  }, [rows]);
  const shown = rows.filter(
    (row) =>
      (filter === "all" || signupStatus(row) === filter) &&
      matchesSearch(row, query),
  );

  const photoKey = rows
    .filter((r) => r.photo_uploaded && r.photo_path)
    .map((r) => r.photo_path)
    .join(",");
  useEffect(() => {
    if (!photoKey) return;
    let cancelled = false;
    teamPhotoUrls(photoKey.split(",")).then((urls) => {
      if (!cancelled) setPhotos(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [photoKey]);

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-semibold text-[26px] tracking-tight">Waitlist</h1>
        <span className="text-[12px] text-faint">
          Updated {formatTime(loadedAt.toISOString())} · refreshes every minute
        </span>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Accounts"
          value={totals.accounts}
          detail={`${totals.newToday} new today`}
        />
        <Stat
          label="Finished · in the raffle"
          value={totals.finished}
          detail={`${pct(totals.finished, totals.accounts)} of accounts`}
        />
        <Stat
          label="In progress"
          value={counts["in-progress"]}
          detail={`${totals.signedInOnly} signed in only`}
        />
        <Stat
          label="School accounts"
          value={totals.school}
          detail={`${totals.personal} personal · ${totals.photos} photos · ${totals.referred} referred`}
        />
      </section>

      <section className="grid items-start gap-3 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-card p-4">
            <h2 className="font-semibold text-[15px]">New accounts per day</h2>
            <p className="text-[12px] text-faint">
              Last {CHART_DAYS} days, Eastern time. Hover a bar for finishers.
            </p>
            <DailyChart days={days} />
          </div>
          <div className="rounded-xl bg-card p-4">
            <h2 className="font-semibold text-[15px]">
              Where sign-ups came from
            </h2>
            <p className="text-[12px] text-faint">
              The ?src= tag on the poster QR code or story link they first came
              in on. "direct" means no tag.
            </p>
            <SourceBars sources={sources} />
          </div>
        </div>
        <div className="rounded-xl bg-card p-4">
          <h2 className="font-semibold text-[15px]">Recent activity</h2>
          <ActivityFeed events={activity} now={loadedAt} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 font-medium text-[13px] transition-colors",
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-primary-tint",
                )}
              >
                {f.label}{" "}
                <span
                  className={cn(
                    filter === f.value ? "opacity-70" : "text-faint",
                  )}
                >
                  {counts[f.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, major, code"
              className="pl-9"
              aria-label="Search accounts"
            />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-muted-foreground">
            {rows.length === 0 ? "No one has signed in yet." : "No matches."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {shown.map((row) => (
              <PersonRow
                key={row.user_id}
                row={row}
                rows={rows}
                photo={row.photo_path ? photos[row.photo_path] : undefined}
                open={open === row.user_id}
                onToggle={() =>
                  setOpen(open === row.user_id ? null : row.user_id)
                }
                now={loadedAt}
                canDelete={row.email !== myEmail}
                onDeleted={() => {
                  setOpen(null);
                  onDeleted(row.user_id);
                }}
              />
            ))}
          </ul>
        )}
      </section>
      <p className="pb-4 text-center text-[12px] text-faint">
        Private to the Verimate team. Don't screenshot or export answers to
        personal devices.
      </p>
    </>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card p-4">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="font-semibold text-[32px] tabular-nums leading-tight tracking-tight">
        {value}
      </span>
      <span className="text-[12px] text-faint">{detail}</span>
    </div>
  );
}

function DailyChart({ days }: { days: DayCount[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.signups));
  const label = (day: string) =>
    new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  const marks = new Set([
    0,
    Math.floor((days.length - 1) / 2),
    days.length - 1,
  ]);

  return (
    <div className="mt-4">
      <div className="relative flex h-36 items-end gap-[2px] border-border border-b">
        {/* Recessive guide at the top value. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-border border-t border-dashed" />
        <span className="pointer-events-none absolute -top-2 right-0 bg-card pl-1 text-[11px] text-faint tabular-nums">
          {max}
        </span>
        {days.map((d, i) => (
          <button
            key={d.day}
            type="button"
            className="group relative flex h-full flex-1 items-end justify-center focus-visible:outline-none"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${label(d.day)}: ${d.signups} new accounts, ${d.finished} finished`}
          >
            <span
              className={cn(
                "w-full max-w-7 rounded-t-[4px] transition-colors",
                d.signups > 0
                  ? hover === i
                    ? "bg-foreground"
                    : "bg-foreground/75"
                  : "bg-muted",
              )}
              style={{
                height: d.signups > 0 ? `${(d.signups / max) * 100}%` : "2px",
              }}
            />
            {hover === i && (
              <span className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-left text-[12px] text-primary-foreground shadow-md">
                <span className="block font-semibold">{label(d.day)}</span>
                {d.signups} new account{d.signups === 1 ? "" : "s"}
                <br />
                {d.finished} finished
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px]">
        {days.map((d, i) => (
          <span
            key={d.day}
            className={cn(
              "flex-1 whitespace-nowrap text-center text-[11px] text-faint",
              i === days.length - 1 && "text-right",
              i === 0 && "text-left",
            )}
          >
            {marks.has(i)
              ? i === days.length - 1
                ? "Today"
                : label(d.day)
              : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// Sign-ups per source tag, as labeled bars (one series, so no legend).
function SourceBars({ sources }: { sources: SourceCount[] }) {
  if (!sources.length)
    return (
      <p className="mt-3 text-[14px] text-muted-foreground">No sign-ups yet.</p>
    );
  const max = Math.max(...sources.map((s) => s.accounts));
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {sources.map((s) => (
        <li
          key={s.source}
          className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-[13px]"
        >
          <span className="truncate font-medium" title={s.source}>
            {s.source}
          </span>
          <span className="h-3 rounded-r-[4px] bg-muted">
            <span
              className="block h-full rounded-r-[4px] bg-foreground/75"
              style={{ width: `${(s.accounts / max) * 100}%` }}
            />
          </span>
          <span className="text-right text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{s.accounts}</span>
            {" · "}
            {s.finished} finished
          </span>
        </li>
      ))}
    </ul>
  );
}

const ACTIVITY_TEXT: Record<Activity["kind"], string> = {
  "signed-up": "signed in for the first time",
  started: "started the survey",
  finished: "finished · entered the raffle",
};

function ActivityFeed({ events, now }: { events: Activity[]; now: Date }) {
  if (!events.length)
    return (
      <p className="mt-3 text-[14px] text-muted-foreground">Nothing yet.</p>
    );
  return (
    <ul className="mt-3 flex flex-col gap-2.5">
      {events.map((e) => (
        <li
          key={`${e.kind}-${e.userId}`}
          className="flex items-start gap-2.5 text-[13px]"
        >
          <span className="mt-0.5 text-faint">
            {e.kind === "finished" ? (
              <CircleCheck className="size-4 text-verified" />
            ) : e.kind === "started" ? (
              <PenLine className="size-4" />
            ) : (
              <LogIn className="size-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-medium">{e.who}</span>{" "}
            <span className="text-muted-foreground">
              {ACTIVITY_TEXT[e.kind]}
            </span>
          </span>
          <span
            className="shrink-0 text-[12px] text-faint tabular-nums"
            title={formatTime(e.at) ?? undefined}
          >
            {timeAgo(e.at, now)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PersonRow({
  row,
  rows,
  photo,
  open,
  onToggle,
  now,
  canDelete,
  onDeleted,
}: {
  row: TeamRow;
  rows: TeamRow[];
  photo?: string;
  open: boolean;
  onToggle: () => void;
  now: Date;
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const status = signupStatus(row);
  const name = displayName(row);
  const school = isSchoolEmail(row.email);
  const weight = teamRaffleWeight(row);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <Avatar name={name} photo={photo} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-semibold text-[15px]">{name}</span>
            {school ? (
              <BadgeCheck
                className="size-4 shrink-0 text-verified"
                aria-label="School account"
              />
            ) : null}
          </span>
          <span className="truncate text-[13px] text-muted-foreground">
            {row.email}
            {!school && " · personal"}
          </span>
        </span>
        <span className="hidden w-40 shrink-0 md:block">
          <StatusPill row={row} status={status} />
        </span>
        <span className="hidden w-28 shrink-0 text-right text-[13px] tabular-nums lg:block">
          {status === "finished" ? (
            <span className="inline-flex items-center gap-1">
              <Gift className="size-3.5 text-faint" />
              {weight.toFixed(2)}
              <span className="text-faint">
                · {pct(winChance(row, rows) * 100, 100)}
              </span>
            </span>
          ) : (
            <span className="text-faint">—</span>
          )}
        </span>
        <span
          className="w-16 shrink-0 text-right text-[12px] text-faint tabular-nums"
          title={formatTime(row.account_created_at) ?? undefined}
        >
          {timeAgo(row.account_created_at, now)}
        </span>
      </button>
      <div className="pb-2 md:hidden">
        <StatusPill row={row} status={status} />
      </div>
      {open && (
        <>
          <PersonDetails row={row} rows={rows} photo={photo} />
          {canDelete && <DeleteAccount row={row} onDeleted={onDeleted} />}
        </>
      )}
    </li>
  );
}

function StatusPill({ row, status }: { row: TeamRow; status: SignupStatus }) {
  if (status === "finished")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-verified-tint px-2.5 py-1 font-medium text-[12px] text-verified">
        <CircleCheck className="size-3.5" />
        Finished
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium text-[12px]">
        <span className="tabular-nums">
          {stepsDone(row)}/{WAITLIST_STEPS.length}
        </span>{" "}
        steps
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-muted px-2.5 py-1 font-medium text-[12px] text-muted-foreground">
      Signed in only
    </span>
  );
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted font-semibold text-[14px] uppercase">
      {photo ? (
        // biome-ignore lint/performance/noImgElement: short-lived signed URL
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

function PersonDetails({
  row,
  rows,
  photo,
}: {
  row: TeamRow;
  rows: TeamRow[];
  photo?: string;
}) {
  const a = answersOf(row);
  const referrer = referrerOf(row, rows);
  const abroad =
    a.studyAbroadPlans
      ?.map(
        (p) =>
          `${label(TERMS, p.term)}${p.place ? ` · ${ABROAD_PLACE_LABELS[p.place] ?? p.place}` : ""}`,
      )
      .join(", ") ?? label(STUDY_ABROAD, a.studyAbroad);

  return (
    <div className="mb-3 grid gap-4 rounded-xl bg-muted/60 p-4 md:grid-cols-[auto_1fr_1fr]">
      {photo ? (
        // biome-ignore lint/performance/noImgElement: short-lived signed URL
        <img
          src={photo}
          alt={displayName(row)}
          className="size-28 rounded-xl object-cover"
        />
      ) : (
        <div className="hidden md:block" />
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
        <Field term="Gender" value={label(GENDERS, a.gender)} />
        <Field term="Year" value={label(YEARS, a.year)} />
        <Field term="Major" value={a.major} />
        <Field term="Budget" value={labels(BUDGETS, a.budget)} />
        <Field term="Areas" value={labels(AREAS, a.areas)} />
        <Field term="Study abroad" value={abroad} />
        <Field term="Sublet out" value={terms(a.subletOutTerms)} />
        <Field term="Sublet in" value={terms(a.subletInTerms)} />
        <Field term="Roommate" value={terms(a.roommateTerms)} />
      </dl>
      <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1.5 text-[13px]">
        <Field term="Drinking" value={label(DRINKING, a.drinking)} />
        <Field term="Smoking" value={label(SMOKING, a.smoking)} />
        <Field term="Cannabis" value={label(CANNABIS, a.cannabis)} />
        <Field term="Greek life" value={label(GREEK_LIFE, a.greekLife)} />
        <Field term="Pets" value={label(PETS, a.pets)} />
        <Field term="Sleep" value={label(SLEEP, a.sleep)} />
        <Field term="Tidiness" value={label(CLEANLINESS, a.cleanliness)} />
        <Field term="Guests" value={label(GUESTS, a.guests)} />
        <Field
          term="Raffle"
          value={
            row.completed_at
              ? `${teamRaffleEntries(row)} entr${teamRaffleEntries(row) === 1 ? "y" : "ies"} · weight ${teamRaffleWeight(row).toFixed(2)} · ${pct(winChance(row, rows) * 100, 100)} chance`
              : "Not entered yet"
          }
        />
        <Field
          term="Referral"
          value={
            row.referral_code
              ? `${row.referral_code} · ${row.referral_count} friend${row.referral_count === 1 ? "" : "s"} counted`
              : null
          }
        />
        <Field
          term="Invited by"
          value={
            row.referred_by
              ? referrer
                ? `${displayName(referrer)} (${row.referred_by})`
                : row.referred_by
              : null
          }
        />
        <Field term="Came from" value={row.source ?? "direct"} />
        <Field term="Account" value={formatTime(row.account_created_at)} />
        <Field term="Last sign-in" value={formatTime(row.last_sign_in_at)} />
        <Field term="Started" value={formatTime(row.started_at)} />
        <Field term="Finished" value={formatTime(row.completed_at)} />
      </dl>
    </div>
  );
}

// Deleting is permanent, so the team types the student's email to confirm.
function DeleteAccount({
  row,
  onDeleted,
}: {
  row: TeamRow;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const name = displayName(row);
  const confirmed = typed.trim().toLowerCase() === row.email;
  const inputId = useId();

  return (
    <div className="mb-3 flex justify-end">
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 />
        Delete account
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (deleting) return;
          setOpen(next);
          if (!next) setTyped("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {name}'s account?</DialogTitle>
            <DialogDescription>
              This permanently removes their sign-in account, every survey
              answer, their photo, their referral code and their raffle entry.
              It can't be undone. If they sign in again later, they start over
              as a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 text-[13px]">
            <label htmlFor={inputId} className="text-muted-foreground">
              Type <strong className="text-foreground">{row.email}</strong> to
              confirm
            </label>
            <Input
              id={inputId}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={deleting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={deleting}
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmed || deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteTeamAccount(row.user_id);
                  toast.success(`Deleted ${name}'s account.`);
                  setOpen(false);
                  onDeleted();
                } catch (error) {
                  console.error(error);
                  toast.error(
                    error instanceof DeleteRefused
                      ? error.message
                      : "Couldn't delete the account. Nothing was removed from the survey; try again.",
                  );
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ term, value }: { term: string; value: string | null }) {
  return (
    <>
      <dt className="text-muted-foreground">{term}</dt>
      <dd className={cn(!value && "text-faint")}>{value || "—"}</dd>
    </>
  );
}

type Options = readonly { value: string; label: string }[];

function label(options: Options, value: string | null): string | null {
  if (value === null) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

function labels(options: Options, values: string[] | null): string | null {
  if (values === null) return null;
  return values.map((v) => label(options, v)).join(", ");
}

function terms(values: string[] | null): string | null {
  if (values === null) return null;
  return values.length ? labels(TERMS, values) : "Not needed";
}

function pct(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function formatTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeAgo(iso: string, now: Date): string {
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - Date.parse(iso)) / 60_000),
  );
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
