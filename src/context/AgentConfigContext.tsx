import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "../services/supabase";
import type { AgentConfig, TabType, ProfileType, AccountType, UserProfile } from "../types/agent";
import { agentConfigSchema, initialConfig, safeHydrateConfig } from "../schemas/agentSchema";

export const accountTypeToProfileType = (type: AccountType): ProfileType => {
  switch (type) {
    case "company":
      return "empresa";
    case "professional":
      return "profissional";
    case "personal":
      return "pessoal";
  }
};

export const profileTypeToAccountType = (profile: ProfileType): AccountType => {
  switch (profile) {
    case "empresa":
      return "company";
    case "profissional":
      return "professional";
    case "pessoal":
      return "personal";
  }
};

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
  // Autenticação & Sessão & Perfil
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  profileLoading: boolean;
  configLoading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (
    updates: Partial<Pick<UserProfile, "full_name" | "avatar_url" | "account_type">>
  ) => Promise<boolean>;
  reloadUserProfile: () => Promise<void>;

  // Estado da Configuração
  config: AgentConfig;
  savedConfig: AgentConfig;
  isDirty: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeModal: "qr" | "calendar" | "json" | "wizard" | null;
  setActiveModal: (modal: "qr" | "calendar" | "json" | "wizard" | null) => void;
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
  connectCalendar: (calendarName?: string | unknown) => Promise<void> | void;
  disconnectCalendar: () => void;
  confirmModal: ConfirmOptions | null;
  requestConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

const AgentConfigContext = createContext<AgentConfigContextType | null>(null);

export const AgentConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados de Autenticação Supabase & Perfil
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
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
  const [activeModal, setActiveModal] = useState<"qr" | "calendar" | "json" | "wizard" | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [discardNonce, setDiscardNonce] = useState(0);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

  // Referências para evitar múltiplos loadings/flickering ao trocar de aba ou foco
  const initialProfileLoadedRef = useRef<string | null>(null);
  const initialConfigLoadedRef = useRef<string | null>(null);

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
      const nextUser = currentSession?.user ?? null;
      setUser((prevUser) => {
        // Preserva a referência se for o mesmo id, evitando re-execuções e flickering de UI
        if (prevUser?.id === nextUser?.id) {
          return prevUser;
        }
        return nextUser;
      });
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Busca e Sincronização do Perfil do Usuário (user_profiles)
  const fetchUserProfile = async (userId: string, silent = false) => {
    if (!silent && initialProfileLoadedRef.current !== userId) {
      setProfileLoading(true);
    }

    try {
      let { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar user_profiles:", error);
      }

      if (!data) {
        // Fallback de contingência caso a trigger ainda não tenha executado
        const initialProfile = {
          id: userId,
          full_name: (user?.user_metadata?.full_name || user?.user_metadata?.name || "") as string,
          avatar_url: (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "") as string,
          account_type: null,
        };
        const { data: created } = await supabase
          .from("user_profiles")
          .insert(initialProfile)
          .select()
          .single();
        if (created) data = created;
      }

      if (data) {
        setUserProfile(data as UserProfile);
        initialProfileLoadedRef.current = userId;

        if (data.account_type) {
          const mappedProfile = accountTypeToProfileType(data.account_type as AccountType);
          setConfig((prev) => {
            if (prev.profile !== mappedProfile) {
              const currentCatalogs = {
                ...prev.catalogsByProfile,
                [prev.profile]: prev.catalog,
              };
              const currentFaqs = {
                ...prev.faqsByProfile,
                [prev.profile]: prev.faq,
              };
              const currentPrompts = {
                ...prev.promptsByProfile,
                [prev.profile]: prev.prompt,
              };
              const currentFiles = {
                ...prev.filesByProfile,
                [prev.profile]: prev.files,
              };

              const nextCatalog =
                currentCatalogs[mappedProfile] ||
                initialConfig.catalogsByProfile[mappedProfile] ||
                [];
              const nextFaq =
                currentFaqs[mappedProfile] ||
                initialConfig.faqsByProfile[mappedProfile] ||
                [];
              const nextPrompt =
                currentPrompts[mappedProfile] ||
                initialConfig.promptsByProfile[mappedProfile] ||
                "";
              const nextFiles =
                currentFiles[mappedProfile] ||
                initialConfig.filesByProfile[mappedProfile] ||
                [];

              const updated: AgentConfig = {
                ...prev,
                profile: mappedProfile,
                catalog: nextCatalog,
                faq: nextFaq,
                prompt: nextPrompt,
                files: nextFiles,
                catalogsByProfile: currentCatalogs,
                faqsByProfile: currentFaqs,
                promptsByProfile: currentPrompts,
                filesByProfile: currentFiles,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("Falha ao comunicar com Supabase (user_profiles):", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const currentUserId = user?.id;

  useEffect(() => {
    if (!currentUserId) {
      setUserProfile(null);
      initialProfileLoadedRef.current = null;
      initialConfigLoadedRef.current = null;
      return;
    }
    const isAlreadyLoaded = initialProfileLoadedRef.current === currentUserId;
    fetchUserProfile(currentUserId, isAlreadyLoaded);
  }, [currentUserId]);

  // 3. Carregamento da Configuração do Supabase (Multi-Tenant isolado por user_id)
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;
    const fetchRemoteConfig = async (silent = false) => {
      if (!silent && initialConfigLoadedRef.current !== currentUserId) {
        setConfigLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("agent_configs")
          .select("config")
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar configuração do Supabase:", error);
          if (!silent) {
            toast.error("Erro ao carregar configuração da nuvem", {
              description: "Usando cópia de contingência local.",
            });
          }
          return;
        }

        if (!isMounted) return;

        if (data && data.config) {
          const hydrated = safeHydrateConfig(data.config);
          initialConfigLoadedRef.current = currentUserId;

          let resolvedConfig = hydrated;

          // Se já houver alterações locais não salvas, não sobrescreve silenciosamente em background
          setConfig((prev) => {
            const hasLocalChanges = JSON.stringify(prev) !== JSON.stringify(savedConfig);
            if (hasLocalChanges && silent) {
              return prev;
            }
            // Se localmente temos calendar: true (ex: acabou de voltar do OAuth), preserva a conexão
            if (prev.calendar && !hydrated.calendar) {
              resolvedConfig = {
                ...hydrated,
                calendar: true,
                calendarName: prev.calendarName || hydrated.calendarName || "Agenda principal",
              };
              return resolvedConfig;
            }
            return hydrated;
          });

          setSavedConfig(resolvedConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedConfig));
        } else {
          // Primeira inicialização do tenant: cria registro inicial no banco
          setConfig(initialConfig);
          setSavedConfig(initialConfig);
          initialConfigLoadedRef.current = currentUserId;
          await supabase.from("agent_configs").insert({
            user_id: currentUserId,
            config: initialConfig,
          });
        }
      } catch (err) {
        console.error("Falha ao comunicar com Supabase:", err);
      } finally {
        if (isMounted) setConfigLoading(false);
      }
    };

    const isAlreadyLoaded = initialConfigLoadedRef.current === currentUserId;
    fetchRemoteConfig(isAlreadyLoaded);

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Detecção profunda de alteração (Dirty State)
  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig]);

  const patchConfig = (partial: Partial<AgentConfig>) => {
    setConfig((prev) => {
      const next: AgentConfig = { ...prev, ...partial };
      if (partial.catalog) {
        next.catalogsByProfile = {
          ...prev.catalogsByProfile,
          [prev.profile]: partial.catalog,
        };
      }
      if (partial.faq) {
        next.faqsByProfile = {
          ...prev.faqsByProfile,
          [prev.profile]: partial.faq,
        };
      }
      if (partial.prompt !== undefined) {
        next.promptsByProfile = {
          ...prev.promptsByProfile,
          [prev.profile]: partial.prompt,
        };
      }
      if (partial.files) {
        next.filesByProfile = {
          ...prev.filesByProfile,
          [prev.profile]: partial.files,
        };
      }
      return next;
    });
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
    setUserProfile(null);
    initialProfileLoadedRef.current = null;
    initialConfigLoadedRef.current = null;
    toast.info("Você saiu da sua conta NexusAgent.");
  };

  const reloadUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, true);
    }
  };

  const updateUserProfile = async (
    updates: Partial<Pick<UserProfile, "full_name" | "avatar_url" | "account_type">>
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return false;
    }

    try {
      const payload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .update(payload)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar perfil do usuário:", error);
        toast.error("Não foi possível atualizar o perfil", {
          description: error.message,
        });
        return false;
      }

      setUserProfile(data as UserProfile);

      // Se account_type foi selecionado ou alterado, sincroniza config.profile sem data bleeding
      if (updates.account_type) {
        const nextProfile = accountTypeToProfileType(updates.account_type);
        let configToPersist: AgentConfig | null = null;

        setConfig((prev) => {
          // 1. Salva coleções atuais no perfil atual
          const currentCatalogs = {
            ...prev.catalogsByProfile,
            [prev.profile]: prev.catalog,
          };
          const currentFaqs = {
            ...prev.faqsByProfile,
            [prev.profile]: prev.faq,
          };
          const currentPrompts = {
            ...prev.promptsByProfile,
            [prev.profile]: prev.prompt,
          };
          const currentFiles = {
            ...prev.filesByProfile,
            [prev.profile]: prev.files,
          };

          // 2. Extrai dados do próximo perfil (ou padrões seguros)
          const nextCatalog =
            currentCatalogs[nextProfile] ||
            initialConfig.catalogsByProfile[nextProfile] ||
            [];
          const nextFaq =
            currentFaqs[nextProfile] ||
            initialConfig.faqsByProfile[nextProfile] ||
            [];
          const nextPrompt =
            currentPrompts[nextProfile] ||
            initialConfig.promptsByProfile[nextProfile] ||
            "";
          const nextFiles =
            currentFiles[nextProfile] ||
            initialConfig.filesByProfile[nextProfile] ||
            [];

          const updated: AgentConfig = {
            ...prev,
            profile: nextProfile,
            catalog: nextCatalog,
            faq: nextFaq,
            prompt: nextPrompt,
            files: nextFiles,
            catalogsByProfile: currentCatalogs,
            faqsByProfile: currentFaqs,
            promptsByProfile: currentPrompts,
            filesByProfile: currentFiles,
          };

          configToPersist = updated;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        if (configToPersist) {
          setSavedConfig(configToPersist);
          // Atualiza a linha de agent_configs na nuvem
          await supabase.from("agent_configs").upsert(
            {
              user_id: user.id,
              config: configToPersist,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      }

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao atualizar perfil", { description: msg });
      return false;
    }
  };

  const connectWhatsApp = () => {
    patchConfig({
      whatsapp: true,
      whatsappInstance: config.whatsappInstance || "Instância Conectada",
      whatsappPhone: config.whatsappPhone || "",
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

  const connectCalendar = async (customName?: string | unknown) => {
    const nameStr = typeof customName === "string" ? customName : undefined;
    const nextCalendarName = nameStr || config.calendarName || "Agenda principal";
    const updated: AgentConfig = {
      ...config,
      calendar: true,
      calendarName: nextCalendarName,
    };
    setConfig(updated);
    setSavedConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (user) {
      try {
        await supabase.from("agent_configs").upsert(
          {
            user_id: user.id,
            config: updated,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (err) {
        console.error("Erro ao sincronizar conexão do Google Agenda no Supabase:", err);
      }
    }

    setActiveModal(null);
    toast.success("Google Agenda conectada!", {
      description: "Permissões concedidas e agenda sincronizada para agendamentos.",
    });
  };

  const disconnectCalendar = () => {
    requestConfirm({
      title: "Desvincular Google Agenda?",
      message: "O agente não poderá mais consultar disponibilidade ou criar novos agendamentos na sua agenda.",
      confirmLabel: "Desvincular",
      isDestructive: true,
      onConfirm: async () => {
        const updated: AgentConfig = {
          ...config,
          calendar: false,
        };
        setConfig(updated);
        setSavedConfig(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (user) {
          try {
            await supabase.from("agent_configs").upsert(
              {
                user_id: user.id,
                config: updated,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          } catch (err) {
            console.error("Erro ao persistir desvinculação no Supabase:", err);
          }
        }

        toast.warning("Google Agenda desvinculada.");
      },
    });
  };

  // Monitora retorno de redirecionamento OAuth do Google Agenda
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected =
      urlParams.get("google_connected") === "true" ||
      urlParams.get("calendar_connected") === "true" ||
      urlParams.get("calendar") === "connected" ||
      urlParams.get("oauth") === "calendar_success";
    const googleError = urlParams.get("google_error") || urlParams.get("error");
    const calendarEmail =
      urlParams.get("calendar_email") ||
      urlParams.get("calendar_name") ||
      urlParams.get("email");

    if (googleConnected) {
      sessionStorage.removeItem("oauth_calendar_pending");
      connectCalendar(calendarEmail || "Agenda principal");

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (googleError) {
      sessionStorage.removeItem("oauth_calendar_pending");
      toast.error("Falha na autenticação do Google Agenda", {
        description:
          decodeURIComponent(googleError) ||
          "Acesso negado ou fluxo cancelado pelo usuário.",
      });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [user]);

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
        userProfile,
        authLoading,
        profileLoading,
        configLoading,
        logout,
        updateUserProfile,
        reloadUserProfile,
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
