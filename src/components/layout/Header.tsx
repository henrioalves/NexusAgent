import React from "react";
import { Sparkles, Power, PowerOff } from "lucide-react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Button } from "../ui/Button";
import { ProfileDropdown } from "./ProfileDropdown";

export const Header: React.FC = () => {
  const {
    config,
    patchConfig,
    setActiveTab,
    setActiveModal,
  } = useAgentConfig();

  const isAgentActive = config.active;

  const handleToggleAgent = () => {
    patchConfig({ active: !isAgentActive });
  };

  return (
    <header className="topbar">
      {/* ÁREA DA MARCA */}
      <div className="brand-area">
        <button
          type="button"
          className="brand"
          onClick={() => setActiveTab("connections")}
          title="NexusAgent - Início"
        >
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          <b>NexusAgent</b>
        </button>
      </div>

      {/* AÇÕES DO CABEÇALHO */}
      <div className="header-actions">
        {/* Status Chip WhatsApp */}
        <button
          type="button"
          className="status-chip hidden lg:flex"
          onClick={() => (!config.whatsapp ? setActiveModal("qr") : setActiveTab("connections"))}
          title={config.whatsapp ? "WhatsApp Conectado (Clique para gerenciar)" : "Conectar WhatsApp"}
        >
          <span className={config.whatsapp ? "dot online" : "dot"} />
          <span>WhatsApp</span>
        </button>

        {/* Status Chip Google Calendar */}
        <button
          type="button"
          className="status-chip hidden lg:flex"
          onClick={() => (!config.calendar ? setActiveModal("calendar") : setActiveTab("connections"))}
          title={config.calendar ? "Google Agenda Sincronizada" : "Conectar Agenda"}
        >
          <span className={config.calendar ? "dot online" : "dot"} />
          <span>Agenda</span>
        </button>

        {/* Botão de Ação / Status do Agente (Ligar / Desligar) */}
        {isAgentActive ? (
          <Button
            variant="secondary"
            icon={PowerOff}
            iconSize={14}
            onClick={handleToggleAgent}
            className="px-3.5 bg-white text-[#1d1d1f] hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-[rgba(0,0,0,0.08)] shadow-sm flex items-center gap-1.5 transition-colors"
            title="O agente está ativo. Clique para pausar."
            aria-label="Pausar Agente"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse mr-0.5 inline-block" />
            <span>Pausar Agente</span>
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={Power}
            iconSize={14}
            onClick={handleToggleAgent}
            className="px-3.5 bg-black text-white hover:bg-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center gap-1.5 transition-all"
            title="O agente está pausado. Clique para ativar."
            aria-label="Ativar Agente"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-0.5 inline-block" />
            <span>Ativar Agente</span>
          </Button>
        )}

        {/* Avatar e Menu de Perfil */}
        <ProfileDropdown />
      </div>
    </header>
  );
};
