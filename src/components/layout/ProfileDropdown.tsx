import React, { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  Key,
  Check,
  Camera,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Shield,
  Upload,
  Trash2,
  Loader2,
  Building2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { supabase } from "../../services/supabase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { UserAvatar, getUserInitials } from "../ui/UserAvatar";
import { AccountSettingsModal } from "../modals/AccountSettingsModal";

export { getUserInitials };

export const ProfileDropdown: React.FC = () => {
  const { user, userProfile, updateUserProfile, logout } = useAgentConfig();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados locais para edição de Nome
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Estado para upload de Foto no Supabase Storage
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estados locais para Alteração de Senha
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Estado para o Modal de Configurações Avançadas de Conta
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);

  // Sincroniza formulário sempre que o perfil atualizar ou o menu abrir
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
    }
  }, [userProfile, isOpen]);

  // Fechamento ao clicar fora ou pressionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);


  const getAccountTypeLabel = () => {
    switch (userProfile?.account_type) {
      case "company":
        return "Conta Empresa";
      case "professional":
        return "Profissional Autônomo";
      case "personal":
        return "Conta Pessoal";
      default:
        return "NexusAgent";
    }
  };

  const getAccountTypeIcon = () => {
    switch (userProfile?.account_type) {
      case "company":
        return <Building2 size={15} />;
      case "professional":
        return <UserCheck size={15} />;
      case "personal":
        return <User size={15} />;
      default:
        return <Building2 size={15} />;
    }
  };

  // Salvar alteração apenas do Nome
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      toast.error("Por favor, digite seu nome completo.");
      return;
    }

    setSavingName(true);
    try {
      const ok = await updateUserProfile({ full_name: trimmed });
      if (ok) {
        toast.success("Nome atualizado com sucesso!");
      }
    } catch {
      toast.error("Erro ao atualizar nome.");
    } finally {
      setSavingName(false);
    }
  };

  // Upload real de Foto para o bucket 'avatars' no Supabase Storage
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Selecione uma imagem válida (PNG, JPG, WEBP, etc.).",
      });
      return;
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo permitido para a foto de perfil é 5MB.",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const ext = file.name.split(".").pop() || "png";
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro no upload para o Supabase Storage:", uploadError);
        toast.error("Falha no upload da foto", {
          description: uploadError.message || "Não foi possível enviar a imagem.",
        });
        return;
      }

      // Obtém a URL pública gerada para a imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Persiste a URL pública no campo avatar_url da tabela user_profiles
      const ok = await updateUserProfile({ avatar_url: publicUrl });
      if (ok) {
        toast.success("Foto de perfil atualizada com sucesso!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao salvar imagem.";
      toast.error("Erro no processamento da imagem", { description: message });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remover foto de perfil atual
  const handleRemovePhoto = async () => {
    if (!userProfile?.avatar_url) return;

    setUploadingPhoto(true);
    try {
      const ok = await updateUserProfile({ avatar_url: null });
      if (ok) {
        toast.success("Foto de perfil removida com sucesso!");
      }
    } catch {
      toast.error("Erro ao remover foto de perfil.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Alterar Senha no Supabase Auth
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCurrent = currentPassword.trim();
    if (!trimmedCurrent) {
      toast.error("A senha atual é obrigatória para prosseguir.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (newPassword === trimmedCurrent) {
      toast.error("A nova senha deve ser diferente da senha atual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem. Digite novamente.");
      return;
    }

    setSavingPassword(true);
    try {
      // 1. Reautenticação segura: valida se a senha atual confere no Supabase Auth
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: trimmedCurrent,
        });

        if (signInError) {
          toast.error("Senha atual incorreta", {
            description: "A senha atual informada não confere com os registros da sua conta.",
          });
          return;
        }
      }

      // 2. Atualiza para a nova senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("Falha ao alterar senha", {
          description: error.message,
        });
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao alterar senha", { description: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  const hasNameChanges = fullName.trim() !== (userProfile?.full_name || "").trim();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* BOTÃO DO AVATAR NO HEADER COM INICIAIS E COR SUTIL NO PADRÃO APPLE MONOCHROME */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full cursor-pointer focus:outline-none transition-transform active:scale-95 flex items-center justify-center select-none"
        title={`Perfil: ${userProfile?.full_name || user?.email || "Minha Conta"}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserAvatar
          avatarUrl={userProfile?.avatar_url}
          name={userProfile?.full_name}
          email={user?.email}
          size="sm"
          className="shadow-xs hover:border-[rgba(0,0,0,0.18)] hover:bg-[#e5e5ea]"
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[360px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(0,0,0,0.08)] p-5 z-50 animate-pop text-left">
          {/* CABEÇALHO DO PERFIL */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-[rgba(0,0,0,0.06)]">
            <div className="relative flex-shrink-0">
              <UserAvatar
                avatarUrl={userProfile?.avatar_url}
                name={userProfile?.full_name}
                email={user?.email}
                size="lg"
                className="shadow-xs"
              />

              {uploadingPhoto && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1d1d1f] truncate leading-tight">
                {userProfile?.full_name || "Usuário NexusAgent"}
              </h3>
              <p className="text-xs text-[#86868b] truncate">{user?.email}</p>
            </div>
          </div>

          {/* SEÇÃO: TIPO DE CONTA (SOMENTE LEITURA COM LINK PARA ÁREA AVANÇADA DE CONFIGURAÇÕES DE CONTA) */}
          <div className="mt-3.5 p-3 bg-[#fafafa] rounded-2xl border border-[rgba(0,0,0,0.04)] flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-[rgba(0,0,0,0.08)] grid place-items-center text-[#1d1d1f] shadow-xs flex-shrink-0">
                {getAccountTypeIcon()}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] block leading-none mb-1">
                  Tipo de Conta
                </span>
                <span className="text-xs font-bold text-[#1d1d1f] truncate block leading-tight">
                  {getAccountTypeLabel()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowAccountSettingsModal(true);
              }}
              className="text-[11px] font-semibold text-[#1d1d1f] hover:text-black flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[rgba(0,0,0,0.08)] hover:bg-[#f5f5f7] shadow-xs transition-colors flex-shrink-0 cursor-pointer"
              title="Configurações avançadas de conta"
            >
              <span>Configurações</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* INPUT OCULTO PARA UPLOAD DE FOTO */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* SEÇÃO DE GERENCIAMENTO DE FOTO DE PERFIL */}
          <div className="mt-4 p-3 bg-[#fafafa] rounded-2xl border border-[rgba(0,0,0,0.04)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Camera size={14} className="text-[#86868b]" />
              <div>
                <span className="text-xs font-semibold text-[#1d1d1f] block leading-tight">
                  Foto de Perfil
                </span>
                <span className="text-[10px] text-[#86868b]">PNG, JPG ou WEBP (máx. 5MB)</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                loading={uploadingPhoto}
                className="h-7 text-[11px] font-semibold px-2.5 rounded-lg flex items-center gap-1 bg-white hover:bg-[#f5f5f7]"
              >
                <Upload size={11} />
                <span>{userProfile?.avatar_url ? "Trocar" : "Enviar"}</span>
              </Button>

              {userProfile?.avatar_url && !uploadingPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="h-7 w-7 rounded-lg grid place-items-center text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remover foto de perfil"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* SEÇÃO: EDITAR NOME */}
          <form onSubmit={handleSaveName} className="mt-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <User size={13} className="text-[#86868b]" />
                Nome Completo
              </label>
              {hasNameChanges && (
                <span className="text-[10px] text-amber-600 font-medium">
                  Não salvo
                </span>
              )}
            </div>

            <Input
              type="text"
              placeholder="Seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 text-xs bg-[#fafafa] border-[rgba(0,0,0,0.08)]"
            />

            {hasNameChanges && (
              <Button
                type="submit"
                variant="primary"
                loading={savingName}
                className="h-8 text-xs font-semibold bg-black text-white hover:bg-[#1d1d1f] rounded-xl flex items-center justify-center gap-1.5 mt-0.5"
              >
                <Check size={13} />
                <span>Salvar Nome</span>
              </Button>
            )}
          </form>

          {/* SEÇÃO: ALTERAR SENHA */}
          <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => {
                if (showPasswordChange) {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }
                setShowPasswordChange(!showPasswordChange);
              }}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#1d1d1f] hover:text-black py-1.5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Key size={14} className="text-[#86868b]" />
                <span>Alterar Senha</span>
              </div>
              {showPasswordChange ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showPasswordChange && (
              <form
                onSubmit={handleChangePassword}
                className="mt-3 flex flex-col gap-2.5 bg-[#f5f5f7] p-3 rounded-2xl border border-[rgba(0,0,0,0.04)] animate-pop"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#1d1d1f]">
                    Senha Atual
                  </label>
                  <Input
                    type="password"
                    placeholder="Sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-8 text-xs bg-white border-[rgba(0,0,0,0.08)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#1d1d1f]">
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-8 text-xs bg-white border-[rgba(0,0,0,0.08)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[#1d1d1f]">
                    Confirmar Nova Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-8 text-xs bg-white border-[rgba(0,0,0,0.08)]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={savingPassword}
                  className="h-8 text-xs font-semibold bg-black text-white hover:bg-[#1d1d1f] rounded-xl flex items-center justify-center gap-1.5 mt-1"
                >
                  <Shield size={13} />
                  <span>Atualizar Senha</span>
                </Button>
              </form>
            )}
          </div>

          {/* SEPARADOR VISUAL */}
          <div className="my-3.5 border-t border-[rgba(0,0,0,0.06)]" />

          {/* BOTÃO SAIR DA CONTA (LOGOUT EM VERMELHO) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
          >
            <LogOut size={15} />
            <span>Sair da Conta</span>
          </button>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÕES AVANÇADAS DE CONTA */}
      <AccountSettingsModal
        isOpen={showAccountSettingsModal}
        onClose={() => setShowAccountSettingsModal(false)}
      />
    </div>
  );
};
