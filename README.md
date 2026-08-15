# Contour Education LMS

A consultation management system built with Next.js, TypeScript, Supabase, and PostgreSQL.

Students can book and manage their own consultations. Administrators have a read-only view of consultations across the system.

## Features

Students can:

- Sign up, log in, and log out
- View and book consultations
- Reschedule scheduled consultations
- Cancel consultations
- Mark consultations as complete or incomplete

Administrators can view all consultations but cannot create, edit, cancel, or change their status.

Consultations follow this lifecycle:

```text
scheduled -> completed
scheduled -> cancelled
completed -> scheduled
cancelled -> no further transitions
```

Completed consultations must be marked incomplete before they can be edited. Cancellation is final and preserves the consultation as a historical record.

## Tech Stack

- Next.js and React
- TypeScript
- Supabase Auth and Supabase SSR
- PostgreSQL
- Tailwind CSS and shadcn/ui
- Vitest

## Architecture

Client-side mutations pass through an HTTP API before reaching the business and persistence layers:

```text
React component
    -> Next.js route handler
    -> consultation service
    -> consultation repository
    -> Supabase / PostgreSQL
```

Initial dashboard data is loaded on the server without an additional HTTP request.

The main responsibilities are separated as follows:

- Route handlers authenticate users and validate request bodies.
- The consultation service enforces lifecycle rules.
- The repository maps application models to database records.
- Zod schemas define the API contracts.

The authenticated user's ID is resolved from their verified Supabase JWT. Consultation ownership cannot be selected by the client. Application roles are read from `app_metadata`, which is not editable by users; anyone without the `admin` role is treated as a student.

## Database

Database changes are defined in `supabase/migrations` and can be reproduced with `npx supabase db reset`.

The main table is `public.consultations`:

| Column            | Type                  | Purpose                                     |
| ----------------- | --------------------- | ------------------------------------------- |
| `id`              | `uuid`                | Primary key                                 |
| `user_id`         | `uuid`                | References the booking user in `auth.users` |
| `first_name`      | `text`                | First name captured when booking            |
| `last_name`       | `text`                | Last name captured when booking             |
| `reason`          | `text`                | Reason for the consultation                 |
| `consultation_at` | `timestamptz`         | Scheduled date and time                     |
| `status`          | `consultation_status` | `scheduled`, `completed`, or `cancelled`    |
| `created_at`      | `timestamptz`         | Creation timestamp                          |
| `updated_at`      | `timestamptz`         | Last modification timestamp                 |

The migrations also:

- Add a trigger that maintains `updated_at`
- Add an index on `user_id` and `consultation_at` for dashboard queries
- Configure database privileges and enable RLS
- Add policies for student ownership and read-only administrator access

### Row-Level Security

The `consultations` table uses PostgreSQL Row-Level Security as a
defence-in-depth authorization layer.

RLS policies enforce that:

- Students can read only their own consultations.
- Students can create consultations only for themselves.
- Students can update only their own consultations.
- Administrators can read all consultations.
- Administrators cannot create or update consultations.
- Authenticated application users cannot delete consultations.

Application-level authorization and consultation lifecycle rules are
still enforced by the Next.js API and service layer. RLS provides an
additional database-level boundary so that ownership and role restrictions
cannot be bypassed through direct Supabase access.

Administrator status is stored in Supabase Auth `app_metadata`. Users
without the `admin` role are treated as students.

## Local Setup

### Prerequisites

- Node.js and npm
- Docker
- Supabase CLI

Install dependencies:

```bash
npm install
```

Start the local Supabase stack:

```bash
npx supabase start
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Populate `.env.local` using the values reported by `npx supabase status`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local publishable key>
SUPABASE_SECRET_KEY=<local secret key>
```

`SUPABASE_SECRET_KEY` is used only by the development seed scripts for privileged local setup operations. Normal application database access uses the authenticated user's Supabase session so that PostgreSQL Row-Level Security policies are enforced.

Create and seed the local database:

```bash
npx supabase db reset
npm run db:seed
```

The seed scripts are safe to run repeatedly and create these development accounts:

| Role          | Email                 | Password      |
| ------------- | --------------------- | ------------- |
| Student       | `student@example.com` | `Student123!` |
| Administrator | `admin@example.com`   | `Admin123!`   |

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The project uses custom local Supabase ports:

| Service    | Address                  |
| ---------- | ------------------------ |
| API        | `http://127.0.0.1:55321` |
| PostgreSQL | `localhost:55322`        |
| Studio     | `http://127.0.0.1:55323` |
| Mailpit    | `http://127.0.0.1:55324` |

## Development Commands

```bash
npm test             # Run unit tests
npm run test:watch   # Run unit tests in watch mode
npm run lint         # Run ESLint
npm run build        # Create a production build
npm run db:seed      # Seed users and consultations
```

The unit tests cover consultation validation and lifecycle rules, authentication mapping, API authorization and ownership, and shared utilities.

## Key Decisions

- **API-first mutations:** Route handlers provide a clear boundary for authentication and request validation, while initial page data is loaded directly on the server.
- **Server-controlled ownership:** Mutation requests never accept a consultation owner; the user ID always comes from the authenticated session.
- **Read-only administrators:** The assessment requires administrators to view all consultations, so they do not receive mutation permissions.
- **Status changes instead of deletion:** Cancelled consultations remain available as historical records.

## Assumptions

- Cancellation is final. A student must create a new consultation after cancelling one.
- Completed consultations are historical records and must be marked incomplete before they can be rescheduled.
- Names stored on a consultation are a snapshot of the booking details and are not kept in sync with Auth metadata.
- Anyone without an explicit `admin` application role is treated as a student.
- Pagination is outside the scope of this assessment. The current query structure can be extended with pagination without changing the route, service, and repository boundaries.

## Trade-offs and Production Considerations

This implementation favours explicit route, service, and repository boundaries over introducing an ORM or client-side server-state library for a single resource. Those abstractions may become useful as the number of entities, screens, and cache interactions grows.

Given more time, the next priorities would be:

- Add pagination to consultation queries.
- Define structured domain errors and consistently map them to API status codes and response bodies.
- Add database integration tests for migrations, RLS policies, and the `updated_at` trigger.
- Add rate limiting, structured logging, and production monitoring around authentication and mutation endpoints.
- Introduce runtime response schemas or generated API types if the API grows beyond this application.
