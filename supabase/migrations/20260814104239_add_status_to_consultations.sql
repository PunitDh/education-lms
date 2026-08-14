CREATE TYPE consultation_status as enum (
  'scheduled',
  'completed',
  'cancelled'
);

ALTER TABLE public.consultations
ADD column status consultation_status not null default 'scheduled';
