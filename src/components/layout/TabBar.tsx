import React from "react";
import { Plug, Users, Clock, Brain, BookOpen } from "lucide-react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { profileMetaRecord } from "../../schemas/agentSchema";
import type { TabType } from "../../types/agent";

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, config } = useAgentConfig();
  const currentProfile = profileMetaRecord[config.profile];

  const tabs: { id: TabType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: "connections", label: "Conexões", icon: Plug },
    { id: "contacts", label: "Atendimento & Contatos", icon: Users },
    { id: "schedule", label: "Horários & Agenda", icon: Clock },
    { id: "identity", label: "Identidade & IA", icon: Brain },
    { id: "knowledge", label: currentProfile.tab, icon: BookOpen },
  ];

  return (
    <nav className="tabs" aria-label="Navegação por abas">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={isActive ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            <Icon size={16} className="icon" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

