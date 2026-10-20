-- ====================================================================
-- NEXUSAGENT - MIGRATION: ATUALIZAÇÃO DE TABELAS (ISOLAMENTO MULTI-TENANT)
-- ====================================================================

-- 1. Garante integridade da tabela user_profiles
DO $$
BEGIN
    -- Garante que as colunas existam com seus tipos esperados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'account_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN account_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Reforça a restrição dos tipos de contas permitidos em user_profiles
ALTER TABLE public.user_profiles 
    DROP CONSTRAINT IF EXISTS check_account_type;

ALTER TABLE public.user_profiles 
    ADD CONSTRAINT check_account_type 
    CHECK (account_type IS NULL OR account_type IN ('company', 'professional', 'personal'));

-- 3. Índices de isolamento e performance em user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type 
    ON public.user_profiles(account_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id 
    ON public.user_profiles(id);

-- 4. Reforço de Row Level Security (RLS) rigoroso em user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem visualizar seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.user_profiles;

CREATE POLICY "Usuários podem visualizar seu próprio perfil"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 5. Reforço de Row Level Security (RLS) rigoroso e integridade em agent_configs
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem visualizar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem criar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem atualizar sua própria configuração" ON public.agent_configs;
DROP POLICY IF EXISTS "Usuários podem deletar sua própria configuração" ON public.agent_configs;

CREATE POLICY "Usuários podem visualizar sua própria configuração"
    ON public.agent_configs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar sua própria configuração"
    ON public.agent_configs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua própria configuração"
    ON public.agent_configs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar sua própria configuração"
    ON public.agent_configs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Índice de busca otimizada para o perfil ativo do agente em agent_configs
CREATE INDEX IF NOT EXISTS idx_agent_configs_profile 
    ON public.agent_configs (((config->>'profile')));

-- 7 Documentação das tabelas e garantia de arquitetura multi-tenant
COMMENT ON TABLE public.user_profiles IS 'Gerencia informações cadastrais do usuário (nome, avatar e tipo de conta selecionado no onboarding).';
COMMENT ON TABLE public.agent_configs IS 'Armazena a inteligência e parametrização do agente isolada por tenant (auth.uid() = user_id).';

