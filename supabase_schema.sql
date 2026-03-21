-- 1. Tabela de Perfis (Extensão do Auth.Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE,
  school TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now())
);

-- 2. Tabela de Logs de Acesso
CREATE TABLE access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now())
);

-- 3. Tabela de Logs de Atividade (Ações no sistema)
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL, -- Ex: 'signup', 'update_profile', 'forum_post'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now())
);

-- 4. Tabela de Consentimento LGPD
CREATE TABLE consent_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  term_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now())
);

-- 5. Tabela de Instituições Educacionais (Base própria para evitar APIs lentas)
CREATE TABLE educational_institutions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT, -- 'university', 'school', 'course'
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('brt'::text, now())
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_institutions ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
CREATE POLICY "Public can view institutions" ON educational_institutions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can suggest institutions" ON educational_institutions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inserir algumas Instituições Populares para começar (Seed)
INSERT INTO educational_institutions (name, type, verified) VALUES 
('USP - Universidade de São Paulo', 'university', true),
('UNICAMP - Universidade Estadual de Campinas', 'university', true),
('UNESP - Universidade Estadual Paulista', 'university', true),
('UFRJ - Universidade Federal do Rio de Janeiro', 'university', true),
('UFMG - Universidade Federal de Minas Gerais', 'university', true),
('PUC-SP - Pontifícia Universidade Católica de São Paulo', 'university', true),
('UNIP - Universidade Paulista', 'university', true),
('ETEC - Escola Técnica Estadual', 'school', true),
('FATEC - Faculdade de Tecnologia', 'university', true),
('Anhanguera', 'university', true),
('Estácio', 'university', true);

-- 6. Função e Gatilho para criar o perfil automaticamente ao cadastrar
-- Isso resolve o erro de RLS pois o Trigger roda com privilégios de sistema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rodar o gatilho sempre que um usuário for criado em auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas de Segurança (Simplificadas agora que o Trigger cuida do INSERT)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert activity logs" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert consent logs" ON consent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert access logs" ON access_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

