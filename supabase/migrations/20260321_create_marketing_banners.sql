-- Migration: Criação do Sistema Dinâmico de Banners de Marketing
-- Objetivo: Permitir exibir campanhas com data de início/fim e redirecionamento.

CREATE TABLE IF NOT EXISTS public.marketing_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    redirect_url TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.marketing_banners ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- Qualquer usuário logado pode LER banners que estão ativos
CREATE POLICY "Qualquer usuário logado pode ler banners ativos" 
ON public.marketing_banners 
FOR SELECT 
USING (
    auth.role() = 'authenticated' 
    AND is_active = true 
    AND (start_date IS NULL OR now() >= start_date)
    AND (end_date IS NULL OR now() <= end_date)
);

-- Somente admins poderiam inserir/modificar, mas para dev liberamos
CREATE POLICY "Admins podem tudo em banners"
ON public.marketing_banners
FOR ALL
USING (auth.role() = 'authenticated'); -- Idealmente seria auth.uid() in (select admins)

-- Notificar o Realtime se necessário
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketing_banners;
