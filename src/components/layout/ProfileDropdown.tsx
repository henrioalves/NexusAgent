import React, { useState, useEffect, useRef } from "react";
import { User, LogOut, Key, Check, Camera, ChevronDown, ChevronUp, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { supabase } from "../../services/supabase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const ProfileDropdown: React.FC = () => {
  const { user, userProfile, updateUserProfile, logout } = useAgentConfig();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados locais para edição de Nome e Foto
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Estados locais para Alteração de Senha
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Sincroniza formulário sempre que o perfil atualizar ou o menu abrir
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setAvatarUrl(userProfile.avatar_url || "");
    }
  }, [userProfile, isOpen]);

  // Fechamento ao clicar fora ou pressionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
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

  // Cálculo das Iniciais do Usuário
  const getInitials = () => {
    if (userProfile?.full_name?.trim()) {
      const parts = userProfile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "NA";
  };

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

  // Salvar alterações de Nome e Foto
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const ok = await updateUserProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim(),
      });
      if (ok) {
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Alterar Senha no Supabase Auth
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem. Digite novamente.");
      return;
    }

    setSavingPassword(true);
    try {
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

  const hasProfileChanges =
    fullName.trim() !== (userProfile?.full_name || "").trim() ||
    avatarUrl.trim() !== (userProfile?.avatar_url || "").trim();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* BOTÃO CIRCULAR (AVATAR) NO HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-semibold text-xs tracking-wider cursor-pointer border border-[rgba(0,0,0,0.1)] shadow-sm hover:ring-2 hover:ring-black/15 transition-all overflow-hidden focus:outline-none"
        title={`Perfil: ${userProfile?.full_name || user?.email || "Minha Conta"}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {userProfile?.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt={userProfile.full_name || "Avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[360px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(0,0,0,0.08)] p-5 z-50 animate-pop text-left">
          {/* CABEÇALHO DO PERFIL */}
          <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,0,0,0.06)]">
            <div className="w-12 h-12 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-sm tracking-wider flex-shrink-0 overflow-hidden border border-[rgba(0,0,0,0.08)]">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.full_name || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1d1d1f] truncate leading-tight">
                {userProfile?.full_name || "Usuário NexusAgent"}
              </h3>
              <p className="text-xs text-[#86868b] truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold tracking-wide text-black bg-[#f5f5f7] px-2 py-0.5 rounded-full border border-[rgba(0,0,0,0.04)]">
                {getAccountTypeLabel()}
              </span>
            </div>
          </div>

          {/* SEÇÃO 1: VER / EDITAR NOME E FOTO */}
          <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                Dados Pessoais
              </span>
              {hasProfileChanges && (
                <span className="text-[10px] text-amber-600 font-medium">
                  Alterações não salvas
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <User size={13} className="text-[#86868b]" />
                Nome Completo
              </label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 text-xs bg-[#fafafa] border-[rgba(0,0,0,0.08)]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Camera size={13} className="text-[#86868b]" />
                URL da Foto de Perfil
              </label>
              <Input
                type="url"
                placeholder="https://exemplo.com/sua-foto.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="h-9 text-xs bg-[#fafafa] border-[rgba(0,0,0,0.08)]"
              />
            </div>

            {hasProfileChanges && (
              <Button
                type="submit"
                variant="primary"
                loading={savingProfile}
                className="h-8 text-xs font-semibold bg-black text-white hover:bg-[#1d1d1f] rounded-xl flex items-center justify-center gap-1.5 mt-1"
              >
                <Check size={13} />
                <span>Salvar Dados</span>
              </Button>
            )}
          </form>

          {/* SEÇÃO 2: OPÇÃO DE ALTERAR SENHA */}
          <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
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

          {/* SEÇÃO 3: BOTÃO SAIR DA CONTA (LOGOUT EM VERMELHO) */}
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
    </div>
  );
};

