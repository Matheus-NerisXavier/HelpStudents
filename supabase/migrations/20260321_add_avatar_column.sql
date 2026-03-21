-- 1. Adicionar coluna na tabela de perfis
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Configurar Bucket de Storage (Comando para o SQL Editor)
-- Nota: O bucket 'avatars' precisa ser criado no Dashboard > Storage primeiro.
-- Mas as políticas abaixo garantem a segurança:

-- Permitir leitura pública dos avatares
CREATE POLICY "Avatares públicos" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- Permitir que usuários façam upload apenas de seus próprios avatares
CREATE POLICY "Upload de avatares próprios" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Atualização de avatares próprios" ON storage.objects 
FOR UPDATE WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);
