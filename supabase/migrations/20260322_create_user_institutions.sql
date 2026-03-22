-- Migration: Habilitando Suporte a Múltiplas Instituições Acadêmicas por Aluno
-- Relação 1..N da tabela user_profiles -> user_institutions

-- 1. Cria a nova tabela (Drop se existir para recriar com a nova estrutura expandida)
DROP TABLE IF EXISTS public.user_institutions CASCADE;

CREATE TABLE public.user_institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    course_name TEXT,
    course_year INTEGER,
    course_period TEXT[] DEFAULT '{}'::text[],
    modality TEXT,
    education_level TEXT,
    class_name TEXT,
    study_schedule JSONB DEFAULT '[]'::jsonb,
    enrollment_id TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.user_institutions ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- Usuário pode inserir suas próprias instituições
CREATE POLICY "Usuário pode gerenciar suas instituições" 
ON public.user_institutions
FOR ALL
USING (auth.uid() = user_id);

-- Leitura pública para perfis de fórum e dashboard de terceiros? Depende do LGPD. 
-- No momento, usuários autenticados deveriam poder ler dados de estudantes para grupos de estudo.
CREATE POLICY "Leitura de instituições para comunidade" 
ON public.user_institutions
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2. Limpar a tabela user_profiles (Removendo campos defasados)
-- AVISO: Isso limpará de vez o perfil genérico, passando toda a escola para a tabela acima.
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS school,
DROP COLUMN IF EXISTS course_name,
DROP COLUMN IF EXISTS course_year,
DROP COLUMN IF EXISTS course_period,
DROP COLUMN IF EXISTS class_name,
DROP COLUMN IF EXISTS study_schedule,
DROP COLUMN IF EXISTS education_level,
DROP COLUMN IF EXISTS campus_type;
