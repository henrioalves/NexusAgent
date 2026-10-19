-- ====================================================================
-- NEXUSAGENT - MIGRATION: CRIAÇÃO DA TABELA AGENT_CONFIGS
-- ====================================================================

-- 1. Habilita a extensão para geração de UUIDs (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação da tabela principal de configurações do agente (agent_configs)
CREATE TABLE IF NOT EXISTS public.agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Garante que cada usuário (tenant) tenha apenas uma configuração de agente ativa
    CONSTRAINT uq_agent_configs_user_id UNIQUE (user_id)
);

-- 3. Criação de índices para máxima performance nas buscas por tenant
CREATE INDEX IF NOT EXISTS idx_agent_configs_user_id 
    ON public.agent_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_configs_updated_at 
    ON public.agent_configs(updated_at DESC);

-- 4. Função e Trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agent_configs_updated_at ON public.agent_configs;
CREATE TRIGGER trigger_agent_configs_updated_at
    BEFORE UPDATE ON public.agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. CONFIGURAÇÃO DE SEGURANÇA MULTI-TENANT (ROW LEVEL SECURITY - RLS)
-- ====================================================================
-- Habilita Row Level Security na tabela para bloqueio total por padrão
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas caso já existam para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem visualizar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem criar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem atualizar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem deletar sua própria configuração" ON public.agent_configs;

-- Política 1: SELECT (Apenas o próprio usuário autenticado pode ler seus dados)
CREATE POLICY "Usuários podem visualizar sua própria configuração"
    ON public.agent_configs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política 2: INSERT (O usuário só pode inserir linhas atribuídas ao seu próprio user_id)
CREATE POLICY "Usuários podem criar sua própria configuração"
    ON public.agent_configs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Política 3: UPDATE (O usuário só pode alterar a linha com o seu próprio user_id)
CREATE POLICY "Usuários podem atualizar sua própria configuração"
    ON public.agent_configs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política 4: DELETE (O usuário só pode excluir a linha com o seu próprio user_id)
CREATE POLICY "Usuários podem deletar sua própria configuração"
    ON public.agent_configs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Confirmação de integridade da tabela
COMMENT ON TABLE public.agent_configs IS 'Tabela SaaS multi-tenant que armazena a configuração completa do NexusAgent por usuário.';
COMMENT ON COLUMN public.agent_configs.user_id IS 'Chave estrangeira vinculada ao auth.users(id) garantindo isolamento total por RLS.';
COMMENT ON COLUMN public.agent_configs.config IS 'Objeto JSON com todas as configurações, regras, horários, catálogo, FAQs e guardrails.';