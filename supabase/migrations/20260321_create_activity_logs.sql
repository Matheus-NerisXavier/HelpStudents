-- Script SQL para criação da tabela de logs de auditoria (LGPD)
-- Execute este comando no SQL Editor do seu Supabase Dashboard

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    route text,
    old jsonb,
    new jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários insiram seus próprios logs
CREATE POLICY "Users can insert their own logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comentário da tabela
COMMENT ON TABLE public.activity_logs IS 'Tabela de auditoria para rastrear alterações de dados sensíveis (LGPD).';
