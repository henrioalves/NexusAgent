import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  UserCheck,
  User,
  Check,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Button } from "../ui/Button";
import type { AccountType } from "../../types/agent";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountTypeInfo {
  id: AccountType;
  title: string;
  tag: string;
  icon: React.FC<{ size?: number; className?: string }>;
  description: string;
}

const ACCOUNT_TYPES: AccountTypeInfo[] = [
  {
    id: "company",
    title: "Empresa",
    tag: "Comércios, Clínicas & Negócios",
    icon: Building2,
    description: "Catálogo estruturado de produtos ou serviços, regras de pagamento e horários da equipe.",
  },
  {
    id: "professional",
    title: "Profissional Autônomo",
    tag: "Médicos, Advogados & Consultores",
    icon: UserCheck,
    description: "Registro profissional (CRM, OAB, CFP), especialidade e agendamento de sessões individuais.",
  },
  {
    id: "personal",
    title: "Pessoal",
    tag: "Secretário & Filtro de Mensagens",
    icon: User,
    description: "Filtro de contatos no WhatsApp, triagem de urgências e anotação cordial de recados.",
  },
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, updateUserProfile } = useAgentConfig();
  const currentAccountType = userProfile?.account_type || "company";
  const [selectedType, setSelectedType] = useState<AccountType>(currentAccountType);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(userProfile?.account_type || "company");
    }
  }, [isOpen, userProfile?.account_type]);

  if (!isOpen) return null;

  const isChanged = selectedType !== currentAccountType;

  const handleSave = async () => {
    if (!isChanged) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const ok = await updateUserProfile({ account_type: selectedType });
      if (ok) {
        toast.success("Tipo de conta atualizado com sucesso!", {
          description: "O NexusAgent foi adaptado ao novo perfil sem perda de dados anteriores.",
        });
        onClose();
      }
    } catch {
      toast.error("Falha ao atualizar o tipo de conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
    >
      <div
        className="relative bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] my-8 animate-pop text-left transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
          <div>
            <span className="eyebrow text-[10px] font-bold uppercase tracking-wider text-[#86868b] dark:text-[#98989d] block mb-1">
              Configurações Avançadas
            </span>
            <h2
              id="account-settings-title"
              className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]"
            >
              Tipo de Conta & Arquitetura
            </h2>
            <p className="text-xs text-[#86868b] dark:text-[#98989d] mt-1 leading-relaxed">
              O tipo de conta orienta as abas, campos de conhecimento e o comportamento da IA.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full grid place-items-center text-[#86868b] dark:text-[#98989d] hover:text-black dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* LISTA DE OPÇÕES COM SELEÇÃO RIGOROSA */}
        <div className="mt-5 space-y-3">
          {ACCOUNT_TYPES.map((opt) => {
            const Icon = opt.icon;
            const isCurrent = currentAccountType === opt.id;
            const isSelected = selectedType === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-white dark:bg-[#2c2c2e] border-2 border-black dark:border-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] ring-2 ring-black/5 dark:ring-white/10"
                    : "bg-[#fafafa] dark:bg-[#242426] border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] hover:border-black/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#2c2c2e]"
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
              >
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {opt.title}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2f2f7] dark:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.1)]">
                        Atual
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-[#86868b] dark:text-[#98989d] block mb-1">
                    {opt.tag}
                  </span>
                  <p className="text-xs text-[#515154] dark:text-[#aeaeb2] leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black scale-105"
                      : "border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#1c1c1e] text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>
            );
          })}
        </div>

        {/* NOTA DE ISOLAMENTO DE DADOS (SEM DATA BLEEDING) */}
        <div className="mt-5 p-3.5 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl border border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.08)] flex items-start gap-2.5 transition-colors duration-200">
          <ShieldCheck size={16} className="text-[#34c759] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#515154] dark:text-[#aeaeb2] leading-relaxed">
            <b>Isolamento total garantido:</b> Cada perfil mantém seu próprio catálogo, produtos, regras e perguntas frequentes. Caso você mude de perfil, os dados cadastrados nos outros perfis permanecem preservados no banco e nunca são sobrescritos.
          </p>
        </div>

        {/* RODAPÉ DO MODAL COM BOTÕES DE AÇÃO */}
        <div className="mt-6 pt-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold px-4 text-[#86868b] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={!isChanged || loading}
            loading={loading}
            className="text-xs font-semibold px-5 h-9 bg-black dark:bg-white text-white dark:text-black hover:bg-[#1d1d1f] dark:hover:bg-gray-200 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span>Salvar Alteração</span>
            {!loading && <ArrowRight size={13} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

