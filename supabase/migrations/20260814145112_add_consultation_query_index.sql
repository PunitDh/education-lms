CREATE INDEX IF NOT EXISTS consultations_user_id_consultation_at_idx
ON public.consultations (user_id, consultation_at desc);