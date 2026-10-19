import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AgentConfig, TabType, ProfileType } from "../types/agent";
import { initialConfig, safeHydrateConfig } from "../schemas/agentSchema";

const STORAGE_KEY = "nexusmind-config";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface AgentConfigContextType {
  config: AgentConfig;
  savedConfig: AgentConfig;
  isDirty: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeModal: "qr" | "pairing" | "calendar" | "json" | "wizard" | null;
  setActiveModal: (modal: "qr" | "pairing" | "calendar" | "json" | "wizard" | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  discardNonce: number;
  patchConfig: (partial: Partial<AgentConfig>) => void;
  patchProfileData: <K extends keyof AgentConfig["profileData"]>(
    profileKey: K,
    data: Partial<AgentConfig["profileData"][K]>
  ) => void;
  saveConfig: () => Promise<void>;
  discardChanges: () => void;
  resetToDefaults: () => void;
  connectWhatsApp: () => void;
  disconnectWhatsApp: () => void;
  connectCalendar: () => void;
  disconnectCalendar: () => void;
  confirmModal: ConfirmOptions | null;
  requestConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

const AgentConfigContext = createContext<AgentConfigContextType | null>(null);

export const AgentConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AgentConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? safeHydrateConfig(JSON.parse(stored)) : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  const [savedConfig, setSavedConfig] = useState<AgentConfig>(() => config);
  const [activeTab, setActiveTab] = useState<TabType>("connections");
  const [activeModal, setActiveModal] = useState<"qr" | "pairing" | "calendar" | "json" | "wizard" | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [discardNonce, setDiscardNonce] = useState(0);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

  // Detecção profunda de alteração (Dirty State)
  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig]);

  const patchConfig = (partial: Partial<AgentConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const patchProfileData = <K extends keyof AgentConfig["profileData"]>(
    profileKey: K,
    data: Partial<AgentConfig["profileData"][K]>
  ) => {
    setConfig((prev) => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        [profileKey]: {
          ...prev.profileData[profileKey],
          ...data,
        },
      },
    }));
  };

  const saveConfig = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSavedConfig(config);
      toast.success("Configurações salvas e agente sincronizado!", {
        description: "Todos os canais e fluxos foram atualizados com sucesso.",
      });
    } catch (err) {
      toast.error("Erro ao salvar configurações", {
        description: "Ocorreu uma falha ao gravar no armazenamento local.",
      });
    }
  };

  const discardChanges = () => {
    setConfig(savedConfig);
    setDiscardNonce((n) => n + 1);
    toast.info("Alterações descartadas", {
      description: "O estado do agente foi restaurado para a versão anterior.",
    });
  };

  const resetToDefaults = () => {
    requestConfirm({
      title: "Restaurar padrões de fábrica?",
      message: "Todas as suas personalizações, regras e conexões serão resetadas para as configurações originais.",
      confirmLabel: "Sim, restaurar",
      isDestructive: true,
      onConfirm: () => {
        setConfig(initialConfig);
        setSavedConfig(initialConfig);
        localStorage.removeItem(STORAGE_KEY);
        setDiscardNonce((n) => n + 1);
        toast.success("Configurações redefinidas para o padrão inicial.");
      },
    });
  };

  const connectWhatsApp = () => {
    patchConfig({
      whatsapp: true,
      whatsappInstance: "nexusmind-main",
      whatsappPhone: config.whatsappPhone || "+55 11 99999-9999",
    });
    setActiveModal(null);
    toast.success("WhatsApp conectado com sucesso!", {
      description: "Instância vinculada e pronta para responder clientes.",
    });
  };

  const disconnectWhatsApp = () => {
    requestConfirm({
      title: "Desconectar WhatsApp?",
      message: "Seu agente de IA deixará de responder aos clientes no WhatsApp imediatamente.",
      confirmLabel: "Desconectar agora",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({ whatsapp: false });
        toast.warning("WhatsApp desconectado", {
          description: "O número foi desvinculado da instância Evolution.",
        });
      },
    });
  };

  const connectCalendar = () => {
    patchConfig({ calendar: true });
    setActiveModal(null);
    toast.success("Google Calendar conectado!", {
      description: "Permissões concedidas para consulta e agendamento de eventos.",
    });
  };

  const disconnectCalendar = () => {
    requestConfirm({
      title: "Desvincular Google Calendar?",
      message: "O agente não poderá mais consultar disponibilidade ou criar novos agendamentos na sua agenda.",
      confirmLabel: "Desvincular",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({ calendar: false });
        toast.warning("Google Calendar desvinculado.");
      },
    });
  };

  const requestConfirm = (options: ConfirmOptions) => {
    setConfirmModal(options);
  };

  const closeConfirm = () => {
    setConfirmModal(null);
  };

  return (
    <AgentConfigContext.Provider
      value={{
        config,
        savedConfig,
        isDirty,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        isDrawerOpen,
        setIsDrawerOpen,
        discardNonce,
        patchConfig,
        patchProfileData,
        saveConfig,
        discardChanges,
        resetToDefaults,
        connectWhatsApp,
        disconnectWhatsApp,
        connectCalendar,
        disconnectCalendar,
        confirmModal,
        requestConfirm,
        closeConfirm,
      }}
    >
      {children}
    </AgentConfigContext.Provider>
  );
};

export function useAgentConfig() {
  const ctx = useContext(AgentConfigContext);
  if (!ctx) {
    throw new Error("useAgentConfig deve ser utilizado dentro de um AgentConfigProvider");
  }
  return ctx;
}

