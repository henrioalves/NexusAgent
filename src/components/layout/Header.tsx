import React from "react";
import { Sparkles, Code2, FlaskConical, Wand2, LogOut } from "lucide-react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/Controls";
import { profileMetaRecord } from "../../schemas/agentSchema";
import type { ProfileType } from "../../types/agent";

export const Header: React.FC = () => {
  const {
    user,
    logout,
    config,
    patchConfig,
    setActiveTab,
    setActiveModal,
    setIsDrawerOpen,
  } = useAgentConfig();

  const currentProfile = profileMetaRecord[config.profile];

  const handleProfileChange = (selectedLabel: string) => {
    let newProfile: ProfileType = "empresa";
    if (selectedLabel === "Profissional") newProfile = "profissional";
    if (selectedLabel === "Pessoal") newProfile = "pessoal";
    patchConfig({ profile: newProfile });
  };

  return (
    <header className="topbar">
      <div className="brand-area">
        <button
          className="brand"
          onClick={() => setActiveTab("connections")}
          title="NexusAgent - Início"
        >
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          <b>NexusAgent</b>
        </button>

        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            icon={Wand2}
            onClick={() => setActiveModal("wizard")}
            className="text-xs"
          >
            <span className="hidden md:inline">Wizard</span>
          </Button>
          <Button
            variant="ghost"
            icon={Code2}
            onClick={() => setActiveModal("json")}
            className="text-xs"
          >
            <span className="hidden md:inline">Payload</span> JSON
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <SegmentedControl
          options={["Empresa", "Profissional", "Pessoal"]}
          value={currentProfile.label}
          onChange={handleProfileChange}
          compact
          className="scale-95 md:scale-100"
        />
      </div>

      <div className="header-actions">
        {/* Status Chip WhatsApp */}
        <button
          className="status-chip hidden lg:flex"
          onClick={() => (!config.whatsapp ? setActiveModal("qr") : setActiveTab("connections"))}
          title={config.whatsapp ? "WhatsApp Conectado (Clique para gerenciar)" : "Conectar WhatsApp"}
        >
          <span className={config.whatsapp ? "dot online" : "dot"} />
          <span>WhatsApp</span>
        </button>

        {/* Status Chip Google Calendar */}
        <button
          className="status-chip hidden lg:flex"
          onClick={() => (!config.calendar ? setActiveModal("calendar") : setActiveTab("connections"))}
          title={config.calendar ? "Google Agenda Sincronizada" : "Conectar Agenda"}
        >
          <span className={config.calendar ? "dot online" : "dot"} />
          <span>Agenda</span>
        </button>

        {/* Master Toggle (Ativo / Pausado) - Visível em todas as telas */}
        <button
          className={`master ${config.active ? "active" : ""}`}
          onClick={() => patchConfig({ active: !config.active })}
          title={config.active ? "Clique para pausar o agente" : "Clique para ativar o agente"}
          role="switch"
          aria-checked={config.active}
        >
          <span />
          <b className="hidden xs:inline">{config.active ? "Ativo" : "Pausado"}</b>
        </button>

        {/* Botão Testar Agente */}
        <Button
          variant="primary"
          icon={FlaskConical}
          onClick={() => setIsDrawerOpen(true)}
          className="px-3"
        >
          <span className="hidden sm:inline">Testar agente</span>
        </Button>

        {/* Botão de Logout / Sair da Conta */}
        {user && (
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={logout}
            title={`Sair da conta (${user.email || ""})`}
            className="px-2.5 text-muted hover:text-red-600"
            aria-label="Sair da conta"
          />
        )}
      </div>
    </header>
  );
};
