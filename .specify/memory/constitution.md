# Verimate Constitution

## Core Principles

### I. Core User Path First

- Every task MUST first deliver the functionality that is explicitly requested now, and MUST
  prioritize getting the core user path working end to end.
- Before starting a task, the work MUST be briefly split into "required now" and "can wait";
  only the former is implemented.
- Features, pages, modules, or infrastructure for unvalidated needs MUST NOT be built ahead of
  time. This includes payments, subscriptions, and admin dashboards imagined for future
  commercialization, unless the current requirement explicitly calls for them.

Rationale: the MVP exists to become runnable, demoable, and able to validate product value as
fast as possible; unvalidated features only add maintenance cost.

### II. Simple, Proven Solutions

- Default to the simplest reasonable implementation. When several approaches exist, choose the
  one with low development cost now and a manageable migration cost later.
- Capabilities provided by existing frameworks and hosted services (Next.js, Supabase, Vercel,
  shadcn/ui, etc.) MUST be preferred over building our own.
- Over-abstraction, premature optimization, complex architectural patterns, and defensive code
  for situations that cannot happen MUST NOT be introduced.
- Keep the code structure clear with well-defined module responsibilities. It may grow
  incrementally; a perfect up-front design is not a goal.

Rationale: proven solutions lower the chance of mistakes and the learning cost; complexity is
only worth paying for once real requirements justify it.

### III. Keep a Path to Commercialization

- The underlying architecture MUST support a future production deployment (currently the
  production-grade Vercel + Supabase combination).
- User identity, data storage, access control, and subscription status MUST rely on
  platform-native mechanisms (Supabase Auth, Postgres tables, RLS) so they can be extended
  later, not on ad-hoc local state or hardcoded values.
- Core business rules MUST NOT be hardcoded in UI components. Key business logic lives in
  `lib/` or server-side functions, reasonably separated from presentation, without introducing
  extra architectural layers.
- Configuration and secrets MUST be managed through environment variables and MUST NOT be
  committed to the repository. Server-side secrets MUST NOT carry the `NEXT_PUBLIC_` prefix.
- Database schema changes MUST be recorded as migration files so they are repeatable and
  traceable.

Rationale: these are the areas that are most expensive to fix after the fact; doing them the
platform-default way now adds almost no cost to the MVP.

### IV. Clearly Separate Mock from Real

- Mock data, test accounts, or payment test modes MAY be used for demos.
- Mocked functionality MUST be identifiable in the code (by naming, location, or comments), and
  delivery notes MUST state clearly what is mocked and what actually works.
- Mock data or test modes MUST NOT be presented to users or developers as real functionality.

Rationale: demos need speed, but blurring mock and real misleads product decisions and plants
problems for launch.

### V. No Compromise on Security and Data Correctness

- Always follow basic security practices: server-side authorization uses `getClaims()` and does
  not trust `getSession()`; new tables MUST enable RLS and grant access explicitly; input is
  validated on the server.
- Changes involving real accounts, user data, permissions, or payments MUST include matching
  security and correctness verification (e.g., RLS policy checks, unauthorized-access checks),
  and these MUST NOT be skipped for speed.
- When a design issue could cause major rework, a security risk, or data loss, it MUST be raised
  proactively and resolved with a more reliable minimal approach.

Rationale: the limit of speed-first is irreversible loss; security incidents and data loss
cannot be fixed by later iterations.

## MVP Implementation Boundaries

Work defaults to Demo / MVP mode, not full Production mode:

- Complex multi-environment management, microservices, container orchestration, load balancing,
  and large-scale performance optimization are not required.
- Full test coverage is not required, and no complex integration test suite is built.
- Basic security practices, semantic HTML, and reasonable error handling (user-visible failures
  show an understandable message) MUST be maintained.
- Development speed is not sacrificed for theoretical extensibility of the code.
- `AGENTS.md` is the source of truth for the tech stack, directory conventions, and common
  commands; it MUST be updated whenever dependencies, directories, or conventions are added.

## Development Workflow and Quality Gates

Way of working:

- Prefer implementing and verifying directly over lengthy technical planning.
- Business decisions, and technical decisions that affect the outcome, MUST be agreed with the
  user first, explaining each option's business impact in non-technical language.

After every development task, at least the following MUST be done:

1. Static checks: `npm run lint`, `npm run typecheck`, and `npm run build` where applicable.
2. Necessary unit tests for core business logic.
3. A smoke test of the core user path in the available built-in browser.
4. Confirmation that key pages load, respond to interaction, and display data correctly.
5. Fixes for any errors that affect main functionality.

Any check that cannot be run MUST be reported with the reason and MUST NOT be claimed as passed.

## Governance

- This constitution takes precedence over other development practices. `AGENTS.md` provides
  concrete runtime development guidance; when the two conflict, this constitution wins and
  `AGENTS.md` is corrected.
- This English file is authoritative. The Chinese translation at
  `.specify/memory/constitution.zh-CN.md` MUST be updated in the same change as any amendment.
- Amendments are made through `/speckit-constitution`, must state what changed and why, and
  update the version and amendment date.
- Versioning follows semantic rules: MAJOR for removing a principle or redefining it
  incompatibly; MINOR for adding a principle or section or materially expanding guidance;
  PATCH for clarifications and non-semantic fixes.
- The Constitution Check in `/speckit-plan` and code reviews MUST verify compliance with this
  constitution; complexity that violates a principle MUST be justified in the plan, or else
  simplified.

**Version**: 1.0.1 | **Ratified**: 2026-10-27 | **Last Amended**: 2026-10-27
