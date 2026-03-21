-- Adicionando novos campos acadêmicos
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS class_name TEXT,
ADD COLUMN IF NOT EXISTS study_schedule JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_profiles.class_name IS 'Nome da turma ou identificador de grupo';
COMMENT ON COLUMN user_profiles.study_schedule IS 'Horários de estudo (ex: ["Manhã", "Tarde"])';
