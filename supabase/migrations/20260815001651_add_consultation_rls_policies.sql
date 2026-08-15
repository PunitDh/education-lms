-- Authenticated users need table-level privileges
GRANT SELECT, INSERT, UPDATE ON TABLE public.consultations TO authenticated;

-- Consultations are never deleted
REVOKE DELETE ON TABLE public.consultations FROM authenticated;

-- Students may read their own consultations
-- Admins may read every consultation
CREATE POLICY "consultations_select" ON public.consultations
FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  OR
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Students may create consultations only for themselves.
-- Admins are read-only.
CREATE POLICY "consultations_insert" ON public.consultations
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND
  COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  ) <> 'admin'
);

-- Students may update their own consultations.
-- Admins are read-only.
CREATE POLICY "consultations_update" ON public.consultations
FOR UPDATE TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  AND
  COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  ) <> 'admin'
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  AND
  COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  ) <> 'admin'
);