REVOKE ALL PRIVILEGES ON TABLE public.consultations
FROM anon, authenticated;

ALTER TABLE public.consultations
ENABLE ROW LEVEL SECURITY;