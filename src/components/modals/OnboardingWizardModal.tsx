import React, { useState } from "react";
import { Check, Phone, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SegmentedControl } from "../ui/Controls";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { profileMetaRecord } from "../../schemas/agentSchema";
import type { ProfileType } from "../../types/agent";

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { config, patchConfig, connectWhatsApp, connectCalendar } = useAgentConfig();
  const [step, setStep] = useState(1);

  const templates = [
    {
      id: "acolhedor",
      title: "Atendimento acolhedor",
      prompt:
        "Atendimento acolhedor: receba cada cliente com gentileza e empatia, tire dúvidas com paciência e conduza com clareza.",
    },
    {
      id: "vendas",
      title: "Vendas consultivas",
      prompt:
        "Vendas consultivas: entenda a necessidade do cliente, apresente os benefícios dos serviços e conduza para o fechamento.",
    },
    {
      id: "agenda",
      title: "Agenda objetiva",
      prompt:
        "Agenda objetiva: foco prioritário em reservar horários livres, checar disponibilidade e confirmar dados de agendamento.",
    },
    {
      id: "pessoal",
      title: "Assistente pessoal",
      prompt:
        "Assistente pessoal: responda de forma breve, gentil e prática, filtre mensagens e mantenha meus compromissos em ordem.",
    },
  ];

  const handleNext = () => {
    if (step === 1 && !config.agentName.trim()) {
      toast.error("Por favor, dê um nome ao seu agente antes de continuar.");
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      toast.success("Configuração inicial concluída com sucesso!");
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Configuração Guiada"
      title="Seu agente pronto em 1 minuto"
    >
      <div className="wizard">
        {/* INDICADOR DE PASSOS (1 A 4) */}
        <div className="steps">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={n <= step ? "active" : ""}>
              {n < step ? <Check size={14} strokeWidth={2.5} /> : n}
            </span>
          ))}
        </div>

        {/* PASSO 1: PERFIL E NOME */}
        {step === 1 && (
          <div className="wizard-body">
            <span className="step-label">Passo 1 de 4</span>
            <h3>Para quem é este agente?</h3>
            <p>Isso adapta os campos, vocabulário e a base de conhecimento ao seu contexto.</p>

            <SegmentedControl
              options={["Empresa", "Profissional", "Pessoal"]}
              value={profileMetaRecord[config.profile].label}
              onChange={(val) => {
                const profile: ProfileType =
                  val === "Empresa" ? "empresa" : val === "Profissional" ? "profissional" : "pessoal";
                patchConfig({ profile });
              }}
              className="mb-4"
            />

            <div className="text-left mt-3">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nome do agente:
              </label>
              <Input
                value={config.agentName}
                onChange={(e) => patchConfig({ agentName: e.target.value })}
                placeholder="Ex: Sofia, Maya, Arthur"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* PASSO 2: TEMPLATE INICIAL */}
        {step === 2 && (
          <div className="wizard-body">
            <span className="step-label">Passo 2 de 4</span>
            <h3>Escolha o estilo inicial de conversa</h3>
            <p>Você poderá refinar e adicionar regras proibidas na aba Identidade.</p>

            <div className="wizard-options">
              {templates.map((tpl) => {
                const isSelected = config.prompt.startsWith(tpl.title);
                return (
                  <button
                    type="button"
                    key={tpl.id}
                    className={isSelected ? "selected" : ""}
                    onClick={() => patchConfig({ prompt: tpl.prompt })}
                  >
                    <span className="radio">
                      <i />
                    </span>
                    <b>{tpl.title}</b>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 3: WHATSAPP */}
        {step === 3 && (
          <div className="wizard-body center">
            <span className="step-label">Passo 3 de 4</span>
            <div className="oauth-icon">
              <Phone size={28} className="text-gray-800" />
            </div>
            <h3>Conectar seu canal WhatsApp</h3>
            <p>
              Você pode simular o pareamento agora mesmo ou concluir a leitura do QR Code mais tarde
              na aba Conexões.
            </p>

            {config.whatsapp ? (
              <span className="badge success text-xs py-1.5 px-3">
                <Check size={12} className="inline mr-1" />
                WhatsApp conectado com sucesso
              </span>
            ) : (
              <Button variant="primary" onClick={connectWhatsApp}>
                Simular conexão rápida
              </Button>
            )}
          </div>
        )}

        {/* PASSO 4: GOOGLE CALENDAR */}
        {step === 4 && (
          <div className="wizard-body center">
            <span className="step-label">Passo 4 de 4</span>
            <div className="oauth-icon">
              <Calendar size={28} className="text-gray-800" />
            </div>
            <h3>Conectar sua agenda Google</h3>
            <p>
              Opcional: permita que a IA consulte seus horários livres e reserve reuniões de forma
              autônoma.
            </p>

            {config.calendar ? (
              <span className="badge success text-xs py-1.5 px-3">
                <Check size={12} className="inline mr-1" />
                Google Agenda conectada
              </span>
            ) : (
              <Button variant="primary" onClick={() => connectCalendar()}>
                Conectar Google Agenda
              </Button>
            )}
          </div>
        )}

        {/* RODAPÉ DO WIZARD */}
        <div className="wizard-footer">
          <Button variant="ghost" onClick={handleBack}>
            {step === 1 ? "Agora não" : "Voltar"}
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {step === 4 ? "Concluir configuração" : "Continuar"}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

