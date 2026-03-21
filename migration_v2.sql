-- 1. Renomear tabela profiles para user_profiles (ou user, conforme preferência, mas user_profiles evita conflitos)
ALTER TABLE IF EXISTS public.profiles RENAME TO user_profiles;

-- 2. Atualizar a função de gatilho para incluir birth_date e school
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, birth_date, school, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    (new.raw_user_meta_data->>'birth_date')::date, 
    new.raw_user_meta_data->>'school', 
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar políticas de RLS (elas precisam ser recriadas ou ajustadas para o novo nome)
-- (O Supabase geralmente mantém, mas é bom garantir no script de migração)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Garantir que as outras tabelas continuem consistentes
-- (access_logs, activity_logs, consent_logs já apontam para auth.users, o que é correto)
