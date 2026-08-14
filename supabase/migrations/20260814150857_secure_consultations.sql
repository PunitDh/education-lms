REVOKE DELETE ON TABLE public.consultations from authenticated;
 
ALTER TABLE public.consultations ENABLE row level security;