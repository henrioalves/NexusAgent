-- ====================================================================
-- NEXUSAGENT - MIGRATION: CRIAÇÃO DO BUCKET DE AVATARES (STORAGE)
-- ====================================================================

-- 1. Criação do bucket público 'avatars' caso ainda não exista
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- Limite de 5MB por arquivo
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Remove políticas anteriores caso existam para evitar conflitos
DROP POLICY IF EXISTS "Avatares são publicamente visíveis" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatar" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatares" ON storage.objects;

-- Política 1: Leitura pública de qualquer imagem do bucket 'avatars'
CREATE POLICY "Avatares são publicamente visíveis"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Política 2: Upload permitido para qualquer usuário autenticado no bucket 'avatars'
CREATE POLICY "Usuários autenticados podem fazer upload de avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

-- Política 3: Atualização de arquivos permitida para usuários autenticados no bucket 'avatars'
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars')
    WITH CHECK (bucket_id = 'avatars');

-- Política 4: Remoção de arquivos no bucket 'avatars'
CREATE POLICY "Usuários podem deletar seus próprios avatares"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars');

