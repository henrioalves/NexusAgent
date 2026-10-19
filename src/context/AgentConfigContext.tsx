import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "../services/supabase";
import type { AgentConfig, TabType, ProfileType } from "../types/agent";
import { agentConfigSchema, initialConfig, safeHydrateConfig } from "../schemas/agentSchema";

const STORAGE_KEY = "nexusagent-config";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface AgentConfigContextType {
  // Autenticação & Sessão
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  configLoading: boolean;
  logout: () => Promise<void>;

  // Estado da Configuração
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
  // Estados de Autenticação Supabase
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);

  // Estados de Configuração
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

  // 1. Monitoramento da Sessão Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Carregamento da Configuração do Supabase (Multi-Tenant isolado por user_id)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchRemoteConfig = async () => {
      setConfigLoading(true);
      try {
        const { data, error } = await supabase
          .from("agent_configs")
          .select("config")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar configuração do Supabase:", error);
          toast.error("Erro ao carregar configuração da nuvem", {
            description: "Usando cópia de contingência local.",
          });
          return;
        }

        if (!isMounted) return;

        if (data && data.config) {
          const hydrated = safeHydrateConfig(data.config);
          setConfig(hydrated);
          setSavedConfig(hydrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
        } else {
          // Primeira inicialização do tenant: cria registro inicial no banco
          setConfig(initialConfig);
          setSavedConfig(initialConfig);
          await supabase.from("agent_configs").insert({
            user_id: user.id,
            config: initialConfig,
          });
        }
      } catch (err) {
        console.error("Falha ao comunicar com Supabase:", err);
      } finally {
        if (isMounted) setConfigLoading(false);
      }
    };

    fetchRemoteConfig();

    return () => {
      isMounted = false;
    };
  }, [user]);

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

  // 3. Salvar e Atualizar Agente via UPSERT no Supabase
  const saveConfig = async () => {
    if (!user) {
      toast.error("Sessão não autenticada", {
        description: "Faça login novamente para persistir alterações na nuvem.",
      });
      return;
    }

    // Validação estrita via Zod antes do envio
    const parsed = agentConfigSchema.safeParse(config);
    if (!parsed.success) {
      toast.error("Dados inválidos para salvamento", {
        description: "Verifique os campos do formulário e tente novamente.",
      });
      return;
    }

    try {
      const { error } = await supabase.from("agent_configs").upsert(
        {
          user_id: user.id,
          config: parsed.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("Erro no upsert Supabase:", error);
        toast.error("Falha ao salvar no banco de dados", {
          description: error.message || "Ocorreu um erro ao sincronizar com o Supabase.",
        });
        return;
      }

      setSavedConfig(config);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success("Configurações salvas e agente sincronizado!", {
        description: "Dados persistidos com segurança no Supabase e prontos para o n8n.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao salvar configurações", { description: msg });
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
      onConfirm: async () => {
        setConfig(initialConfig);
        setSavedConfig(initialConfig);
        setDiscardNonce((n) => n + 1);

        if (user) {
          await supabase.from("agent_configs").upsert(
            {
              user_id: user.id,
              config: initialConfig,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }

        localStorage.removeItem(STORAGE_KEY);
        toast.success("Configurações redefinidas para o padrão inicial.");
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.info("Você saiu da sua conta NexusAgent.");
  };

  const connectWhatsApp = () => {
    patchConfig({
      whatsapp: true,
      whatsappInstance: "nexusagent-main",
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
        user,
        session,
        authLoading,
        configLoading,
        logout,
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
