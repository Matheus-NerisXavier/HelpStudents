-- Adicionando campos acadêmicos detalhados à tabela user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS course_name TEXT,
ADD COLUMN IF NOT EXISTS course_year INTEGER,
ADD COLUMN IF NOT EXISTS course_period TEXT CHECK (course_period IN ('Manhã', 'Tarde', 'Noite', 'Integral')),
ADD COLUMN IF NOT EXISTS student_bio TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- Comentários para documentação (LGPD/Metadados)
COMMENT ON COLUMN user_profiles.course_name IS 'Nome do curso ou série escolar';
COMMENT ON COLUMN user_profiles.course_period IS 'Período das aulas (turno)';
