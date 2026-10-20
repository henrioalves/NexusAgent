import React, { useState } from "react";
import { Building2, UserCheck, User, Sparkles, Check, ArrowRight, LogOut, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Button } from "../ui/Button";
import type { AccountType } from "../../types/agent";

interface AccountTypeOption {
  id: AccountType;
  title: string;
  tag: string;
  icon: React.FC<{ size?: number; className?: string }>;
  description: string;
  whyChoose: string;
  features: string[];
}

const ACCOUNT_OPTIONS: AccountTypeOption[] = [
  {
    id: "company",
    title: "Empresa",
    tag: "Comércios, Clínicas & Negócios",
    icon: Building2,
    description:
      "Ideal para empresas que precisam de catálogo estruturado de produtos ou serviços, múltiplos atendentes, regras comerciais estritas e formas de pagamento.",
    whyChoose:
      "O agente representará institucionalmente a sua marca, tirando dúvidas sobre produtos, informando opções de Pix/Cartão e organizando horários da equipe.",
    features: [
      "Catálogo com preços, prazos e fotos",
      "Chave Pix e formas de pagamento",
      "Horários comerciais e plantão",
      "Endereço e link do Google Maps",
    ],
  },
  {
    id: "professional",
    title: "Profissional Autônomo",
    tag: "Médicos, Advogados & Especialistas",
    icon: UserCheck,
    description:
      "Perfeito para quem atua em nome próprio ou em consultório e necessita de identificação de conselho (CRM, OAB, etc.), especialidade técnica e agendamento de sessões.",
    whyChoose:
      "O agente evidenciará sua formação, especialidade e credenciais, cuidando da triagem inicial e agendando horários com alto padrão de discrição.",
    features: [
      "Registro profissional (CRM, OAB, CFP)",
      "Especialidade e áreas de atendimento",
      "Agendamento de consultas ou sessões",
      "Consultório físico ou telemedicina",
    ],
  },
  {
    id: "personal",
    title: "Pessoal",
    tag: "Assistente Pessoal & Filtro",
    icon: User,
    description:
      "Para quem recebe alto volume de mensagens e quer um assistente executivo no WhatsApp para filtrar contatos, registrar recados e proteger seu tempo de descanso.",
    whyChoose:
      "O agente atuará como seu secretário particular, respondendo mensagens cordialmente, repassando apenas urgências e filtrando desconhecidos.",
    features: [
      "Filtro inteligente de mensagens e grupos",
      "Triagem de urgências e recados",
      "Proteção de horários de folga e lazer",
      "Contexto pessoal e orientações sob medida",
    ],
  },
];

export const AccountTypeSetup: React.FC = () => {
  const { updateUserProfile, logout, user } = useAgentConfig();
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedType) {
      toast.error("Selecione um tipo de conta para continuar.");
      return;
    }

    setLoading(true);
    try {
      const ok = await updateUserProfile({ account_type: selectedType });
      if (ok) {
        toast.success("Perfil de conta definido com sucesso!", {
          description: "Adaptando o NexusAgent ao modelo escolhido...",
        });
      }
    } catch {
      toast.error("Falha ao salvar seleção de conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between p-4 sm:p-6 md:p-10">
      {/* BARRA SUPERIOR DISCRETA */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black text-white grid place-items-center shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-base tracking-tight text-[#1d1d1f]">
            NexusAgent
          </span>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold text-[#86868b] hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-black/[0.04] transition-colors"
          title={`Sair da conta atual (${user?.email || ""})`}
        >
          <LogOut size={14} />
          <span>Sair da conta</span>
        </button>
      </div>

      {/* ÁREA CENTRAL: CABEÇALHO E CARDS */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center my-auto py-6">
        {/* CABEÇALHO DE BOAS-VINDAS */}
        <div className="max-w-2xl mb-10">
          <span className="eyebrow inline-block mb-2 text-[11px] font-bold tracking-widest text-[#86868b] bg-white px-3 py-1 rounded-full border border-[rgba(0,0,0,0.06)] shadow-sm">
            CONFIGURAÇÃO INICIAL OBRIGATÓRIA
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-3">
            Qual é o seu tipo de conta?
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] leading-relaxed">
            Selecione o modelo que melhor descreve sua rotina. O NexusAgent personalizará o comportamento da IA, os campos do catálogo e a base de conhecimento de acordo com sua escolha.
          </p>
        </div>

        {/* OS 3 GRANDES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-10">
          {ACCOUNT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.id;

            return (
              <div
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-white border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.02] ring-4 ring-black/5"
                    : "bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-black/25 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedType(option.id);
                  }
                }}
              >
                {/* TOPO DO CARD COM ÍCONE E INDICADOR DE SELEÇÃO */}
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl grid place-items-center transition-colors ${
                        isSelected ? "bg-black text-white" : "bg-[#f5f5f7] text-[#1d1d1f]"
                      }`}
                    >
                      <Icon size={24} />
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-black border-black text-white scale-110"
                          : "border-[#d2d2d7] bg-white text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-[#86868b] tracking-wide uppercase block mb-1">
                    {option.tag}
                  </span>
                  <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-2.5">
                    {option.title}
                  </h2>
                  <p className="text-xs text-[#86868b] leading-relaxed mb-4">
                    {option.description}
                  </p>

                  {/* BOX: POR QUE ESCOLHER */}
                  <div className="bg-[#f5f5f7] rounded-2xl p-3.5 mb-5 border border-[rgba(0,0,0,0.03)]">
                    <span className="text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wider block mb-1">
                      Por que escolher:
                    </span>
                    <p className="text-xs text-[#515154] leading-relaxed">
                      {option.whyChoose}
                    </p>
                  </div>
                </div>

                {/* DESTAQUES / RECURSOS */}
                <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block mb-2.5">
                    O que está incluso:
                  </span>
                  <ul className="space-y-2">
                    {option.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#1d1d1f]">
                        <CheckCircle2
                          size={14}
                          className={isSelected ? "text-black" : "text-[#86868b]"}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTÃO PRINCIPAL DE CONFIRMAÇÃO */}
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedType || loading}
            loading={loading}
            className="w-full h-12 text-sm font-semibold bg-black text-white hover:bg-[#1d1d1f] shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 rounded-2xl transition-all"
          >
            <span>Confirmar e Configurar Agente</span>
            {!loading && <ArrowRight size={16} />}
          </Button>

          <p className="text-[11px] text-[#86868b]">
            Esta escolha é definitiva e moldará as abas e regras do seu assistente no NexusAgent.
          </p>
        </div>
      </div>

      {/* RODAPÉ INSTITUCIONAL */}
      <div className="w-full max-w-6xl mx-auto pt-6 border-t border-[rgba(0,0,0,0.06)] text-center text-[11px] text-[#86868b]">
        NexusAgent — Inteligência Artificial Conversacional Isolada & Segura
      </div>
    </div>
  );
};

