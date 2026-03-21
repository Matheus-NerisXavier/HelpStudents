-- 1. Remove políticas antigas caso existam para evitar conflitos
DROP POLICY IF EXISTS "Avatares públicos" ON storage.objects;
DROP POLICY IF EXISTS "Upload de avatares próprios" ON storage.objects;
DROP POLICY IF EXISTS "Atualização de avatares próprios" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update" ON storage.objects;

-- 2. Permite que QUALQUER pessoa veja as fotos de perfil (necessário para o Dashboard)
CREATE POLICY "Avatares_Select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Permite que usuários LOGADOS façam upload de imagens (o Supabase preenche o 'owner' automaticamente)
CREATE POLICY "Avatares_Insert" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- 4. Permite que usuários substituam (upsert) a própria foto
CREATE POLICY "Avatares_Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 5. Garanta que o bucket avatars existe!
-- (Se ainda não criou o bucket, vá em Storage -> New Bucket -> "avatars" -> Marque "Public")
