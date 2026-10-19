-- ====================================================================
-- NEXUSAGENT - MIGRATION: CRIAÇÃO DA TABELA USER_PROFILES
-- ====================================================================

-- 1. Criação da tabela de perfis de usuários (user_profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    account_type TEXT CHECK (account_type IN ('company', 'professional', 'personal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices de performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type 
    ON public.user_profiles(account_type);

-- 3. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 4. CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ====================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores caso existam
DROP POLICY IF EXISTS "Usuários podem visualizar seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.user_profiles;

-- Política 1: SELECT (Apenas o próprio usuário autenticado pode ler seu perfil)
CREATE POLICY "Usuários podem visualizar seu próprio perfil"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Política 2: UPDATE (Apenas o próprio usuário autenticado pode alterar seu perfil)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política 3: INSERT (Permite inserção pelo próprio usuário caso necessário)
CREATE POLICY "Usuários podem inserir seu próprio perfil"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 5. TRIGGER AUTOMÁTICO NA CRIAÇÃO DE USUÁRIO (AUTH.USERS -> USER_PROFILES)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url, account_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        NULL
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();

-- 6. Retrocompatibilidade: Garante que usuários já cadastrados no auth.users tenham registro em user_profiles
INSERT INTO public.user_profiles (id, full_name, avatar_url, account_type)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
    COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
    NULL
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Documentação e comentários
COMMENT ON TABLE public.user_profiles IS 'Tabela que gerencia os perfis e tipo definitivo de conta dos usuários NexusAgent.';
COMMENT ON COLUMN public.user_profiles.id IS 'Chave primária vinculada diretamente a auth.users(id) com exclusão em cascata.';
COMMENT ON COLUMN public.user_profiles.account_type IS 'Tipo de conta fixado: company, professional ou personal.';

