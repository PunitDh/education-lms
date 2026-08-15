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

Database changes are managed through `supabase/migrations`. The consultations table uses a PostgreSQL enum for status, an index for user consultation queries, and a trigger to maintain `updated_at`.

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

`SUPABASE_SECRET_KEY` is used only by server-side repository operations and development seed scripts. It must not be exposed to browser code or committed to source control.

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
