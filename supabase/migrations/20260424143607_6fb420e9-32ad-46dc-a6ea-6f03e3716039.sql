-- Replace broad SELECT policy with owner-scoped one to prevent listing other users' files.
-- Public URL access still works for the public 'avatars' bucket (CDN bypasses RLS).
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Users can list their own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);