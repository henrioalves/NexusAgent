import React from "react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { profileMetaRecord } from "../../schemas/agentSchema";

export const PageTitle: React.FC = () => {
  const { activeTab, config } = useAgentConfig();
  const profileMeta = profileMetaRecord[config.profile];

  const titles: Record<string, [string, string]> = {
    connections: [
      "Conexões e canais",
      "Gerencie as integrações oficiais que dão voz e contexto em tempo real ao seu agente.",
    ],
    contacts: [
      "Atendimento e contatos",
      "Defina onde a inteligência atua, exceções autorizadas e quando a equipe deve assumir.",
    ],
    schedule: [
      "Horários e agenda",
      "Controle a disponibilidade semanal, intervalos de almoço, feriados e regras de agendamento.",
    ],
    identity: [
      "Identidade e comportamento",
      "Dê personalidade, tom de voz, guardrails invioláveis e diretrizes únicas ao seu agente.",
    ],
    knowledge: [profileMeta.tab, profileMeta.subtitle],
  };

  const [heading, subtitle] = titles[activeTab] || titles.connections;

  // Cálculo dinâmico do percentual de configuração concluída
  const calculateProgress = () => {
    let score = 30; // base inicial
    if (config.whatsapp) score += 20;
    if (config.calendar) score += 15;
    if (config.catalog.length > 0) score += 15;
    if (config.faq.length > 0) score += 10;
    if (config.files.length > 0) score += 10;
    return Math.min(100, score);
  };

  const progress = calculateProgress();

  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">Configuração do agente</span>
        <h1>{heading}</h1>
        <p>{subtitle}</p>
      </div>
      <span className="completion hidden sm:inline-flex items-center gap-1.5">
        <b>{progress}%</b> configurado
      </span>
    </div>
  );
};

