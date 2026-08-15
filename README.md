# Contour Education LMS

A lightweight consultation management system built with Next.js, TypeScript, Supabase and PostgreSQL.

The application allows students to book and manage consultations, while administrators have a read-only view of consultations across the system.

## Tech Stack

- Next.js
- React
- TypeScript
- Supabase Auth
- Supabase SSR
- PostgreSQL
- Tailwind CSS
- shadcn/ui

## Features

### Students

Students can:

- Sign up, log in and log out
- View their own consultations
- Book a consultation
- Reschedule a scheduled consultation
- Cancel a consultation
- Mark a consultation as complete
- Mark a completed consultation as incomplete

### Administrators

Administrators can:

- Log in
- View consultations across the entire system

Administrator accounts are intentionally read-only and cannot create, edit, cancel or change the status of consultations.

## Consultation Lifecycle

Consultations use the following statuses:

- `scheduled`
- `completed`
- `cancelled`

The supported transitions are:

```text
scheduled -> completed
scheduled -> cancelled
completed -> scheduled
cancelled -> no further transitions
```

A completed consultation may be marked incomplete, which moves it back to `scheduled`.

Cancelled consultations are considered final. A student who wishes to book again must create a new consultation.

Completed consultations are treated as historical records and cannot be edited unless first marked incomplete.

## Architecture

The application separates UI, HTTP, business logic and persistence concerns.

Client-side mutations follow:

```text
React Client Component
    ↓
Consultation API Client
    ↓
Next.js Route Handler
    ↓
Consultation Service
    ↓
Consultation Repository
    ↓
Supabase / PostgreSQL
```

Initial dashboard data is loaded server-side:

```text
Next.js Server Component
    ↓
Consultation Service
    ↓
Consultation Repository
    ↓
Supabase / PostgreSQL
```

This avoids unnecessary HTTP requests during server rendering while still exposing API endpoints for client-side mutations.

## Authentication and Authorisation

Authentication is provided by Supabase Auth.

Supabase's built-in `authenticated` database role identifies users who are signed in, while application-specific roles distinguish students from administrators.

Application roles are stored in Supabase Auth `app_metadata`.

Supported roles are:

```text
student
admin
```

Users without an explicit administrator role are treated as students.

`app_metadata` is used for authorisation rather than user-editable metadata.

The authenticated user's ID is always derived on the server from the verified Supabase JWT. The client cannot choose the `user_id` associated with a consultation.

First and last names are stored in Auth user metadata and are also copied onto consultation records as a snapshot of the booking information.

## Database

The primary application table is:

```text
public.consultations
```

Each consultation contains:

- UUID primary key
- Auth user UUID
- First name
- Last name
- Reason
- Consultation datetime
- Status
- Created timestamp
- Updated timestamp

Consultation status is represented by a PostgreSQL enum rather than unrestricted text.

Database schema changes are managed entirely through migrations in:

```text
supabase/migrations/
```

An `updated_at` database trigger automatically updates the modification timestamp when a consultation changes.

## Prerequisites

The following are required to run the application locally:

- Node.js and npm
- Docker
- Git

Docker must be running before starting the local Supabase environment.

## Local Setup

Clone the repository:

```bash
git clone https://github.com/PunitDh/education-lms.git
cd education-lms
```

Install dependencies:

```bash
npm install
```

Start the local Supabase stack:

```bash
npx supabase start
```

The project uses custom local Supabase ports configured in `supabase/config.toml`.

The main local services are:

```text
Supabase API:    http://127.0.0.1:55321
PostgreSQL:      port 55322
Supabase Studio: http://127.0.0.1:55323
Mailpit:         http://127.0.0.1:55324
```

Once Supabase has started, run:

```bash
npx supabase status
```

This displays the local API URL and API keys.

Copy the environment template:

```bash
cp .env.example .env.local
```

Then populate `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your local publishable key>
SUPABASE_SECRET_KEY=<your local secret key>
```

### Environment Variables

`NEXT_PUBLIC_SUPABASE_URL`

The Supabase API URL used by the browser and server Supabase clients.

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The publishable Supabase API key. This key is intentionally available to browser code.

`SUPABASE_SECRET_KEY`

A privileged server-side Supabase key used by the consultation
repository and development seed scripts.

Consultation data is intentionally not exposed directly to browser
clients. Database privileges for the `anon` and `authenticated`
PostgreSQL roles are revoked, and application data access is performed
through the server-only repository layer.

The secret key must never be exposed through a `NEXT_PUBLIC_`
environment variable, committed to source control, or used by browser
code.

## Create the Database

Reset the local database:

```bash
npx supabase db reset
```

This recreates the database and applies every migration in `supabase/migrations`.

The project intentionally does not use Supabase's built-in SQL seed file because login-capable Supabase Auth users need to be created through the Auth Admin API.

## Seed Development Data

Run:

```bash
npm run db:seed
```

This:

1. Creates or updates the development student and administrator accounts
2. Creates sample consultations associated with the seeded student account

The seed scripts are safe to run repeatedly.

### Seed Accounts

Student:

```text
Email:    student@example.com
Password: Student123!
```

Administrator:

```text
Email:    admin@example.com
Password: Admin123!
```

The administrator user receives:

```text
app_metadata.role = "admin"
```

The student has no privileged application role and is therefore treated as a normal student.

## Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Fresh Local Reset

To recreate the application from a completely clean database:

```bash
npx supabase db reset
npm run db:seed
npm run dev
```

This is useful for verifying that the database can be reconstructed entirely from committed migrations and seed scripts.

## Development Commands

Run the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Reset the local database:

```bash
npx supabase db reset
```

Seed development users and consultations:

```bash
npm run db:seed
```

## Design Decisions and Assumptions

### API-first mutations

Consultation mutations use Next.js Route Handlers rather than Server Actions.

This provides an explicit HTTP API boundary and keeps request handling separate from business and persistence logic.

### Server-side user ownership

Consultation ownership is never supplied by the browser.

The authenticated user's UUID is resolved from Supabase Auth on the server and supplied to the consultation service and repository.

### Database access security

Consultation data is not queried directly from browser Supabase clients.

The `anon` and `authenticated` roles have their table privileges revoked.
All consultation reads and writes pass through the Next.js server,
service and repository layers.

The repository uses a server-only Supabase secret key. Authentication
continues to use the normal publishable-key Supabase SSR client.

This keeps authentication, authorization, API validation and business
rules within the application boundary while preventing clients from
bypassing the API and accessing the consultations table directly.

### Read-only administrators

The assessment requires administrators to be able to see all consultations but does not require administrators to manage them.

Administrator functionality is therefore intentionally read-only.

### Application roles

The application distinguishes between Supabase authentication roles and application roles.

Supabase's `authenticated` role represents authentication state, while `app_metadata.role` represents application-level authorisation.

### No separate profile table

A separate profile table was not introduced because the application currently requires only basic identity information.

First and last names are stored in Supabase Auth user metadata and consultation records reference the authenticated user through `auth.users.id`.

A profile table could be introduced later if user-specific application data becomes more substantial.

### Cancellation

Cancelling a consultation changes its status rather than deleting it.

This preserves historical data and prevents cancellation from destroying an application record.

### Datetimes

Consultation datetimes are converted to ISO timestamps before being sent to the API and are stored by PostgreSQL using `timestamptz`.

### Type safety

Application-facing consultation and authentication models are represented using TypeScript types rather than exposing raw Supabase JWT or database row structures throughout the application.

## Future Considerations

For a larger production system, potential additions could include:

- Pagination for large consultation datasets
- Audit history
- Automated reminders
- More granular administrator permissions
- Additional consultation workflow states

These were intentionally left outside the scope of this assessment.
