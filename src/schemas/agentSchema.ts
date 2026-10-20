import { z } from "zod";
import type { AgentConfig, ProfileType, ProfileMeta } from "../types/agent";
import { generateUUID } from "../utils/uuid";

export const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export const profileMetaRecord: Record<ProfileType, ProfileMeta> = {
  empresa: {
    label: "Empresa",
    tab: "Empresa & Conhecimento",
    title: "Dados da empresa",
    subtitle: "Contexto institucional usado em cada conversa.",
    catalog: "Produtos e serviços",
  },
  profissional: {
    label: "Profissional",
    tab: "Meu Perfil & Serviços",
    title: "Perfil profissional",
    subtitle: "Credenciais, especialidade e informações de atendimento.",
    catalog: "Serviços e procedimentos",
  },
  pessoal: {
    label: "Pessoal",
    tab: "Sobre Mim & Contexto",
    title: "Sobre você",
    subtitle: "Contexto pessoal para uma assistência realmente útil.",
    catalog: "Atividades e projetos",
  },
};

export const afterHoursOptions = [
  "Atendimento IA 24/7 normal",
  "Atender e agendar, mas avisar que está fechado",
  "Enviar mensagem única de ausência",
  "Ficar totalmente mudo",
] as const;

export const initialConfig: AgentConfig = {
  version: 2,
  profile: "empresa",
  active: true,
  whatsapp: false,
  whatsappInstance: "",
  whatsappPhone: "",
  calendar: false,
  calendarName: "",
  ignoreGroups: true,
  ignoreStories: true,
  contactMode: "all",
  exceptions: [],
  pauseOnManual: true,
  reactivateHours: 24,
  recentContacts: [],
  overflow: {
    human: true,
    unknown: true,
    angry: true,
    cancellationRefund: true,
    phone: "",
    phones: [],
  },
  timezone: "America/Sao_Paulo (GMT-03:00)",
  days: weekDays.map((name, index) => ({
    name,
    open: index < 5,
    start: "08:00",
    end: "18:00",
    lunch: index < 5,
    lunchStart: "12:00",
    lunchEnd: "13:30",
  })),
  autoHolidays: true,
  holidays: [],
  lunchBehavior: "Atender e avisar quando a equipe retorna",
  afterHours: "Atender e agendar, mas avisar que está fechado",
  awayMessage: "Olá! No momento estamos fora do horário de atendimento, mas sua mensagem foi registrada e retornaremos em breve.",
  duration: "30 min",
  durationMode: "fixed",
  customDuration: 30,
  buffer: 10,
  minNotice: 2,
  minAdvanceTime: 2,
  minAdvanceUnit: "hours",
  maxFuture: 30,
  bookingFields: ["Nome completo", "Serviço / motivo"],
  reschedule: true,
  agentName: "",
  introduce: true,
  discloseAI: false,
  goal: "Agendamento",
  goals: ["Agendamento"],
  tone: "Amigável",
  tones: ["Amigável"],
  responseLength: 35,
  emojis: "Moderado",
  debounce: 10,
  splitMessages: true,
  typing: true,
  audio: true,
  images: true,
  guardrails: [
    "Nunca inventar preços ou horários",
    "Nunca conceder descontos não cadastrados",
    "Nunca opinar sobre temas sensíveis ou fora do escopo",
    "Nunca dar diagnósticos técnicos ou médicos definitivos",
  ],
  customRules: [],
  prompt: "",
  profileData: {
    company: {
      name: "",
      cnpj: "",
      summary: "",
      address: "",
      online: false,
      wifiPassword: "",
      maps: "",
      payments: [],
      pix: "",
      links: "",
      additionalInfo: "",
    },
    professional: {
      name: "",
      registry: "",
      specialty: "",
      address: "",
      links: "",
      payments: [],
      additionalInfo: "",
    },
    personal: {
      name: "",
      summary: "",
      city: "",
      topics: "",
      links: "",
      additionalInfo: "",
    },
  },
  catalog: [],
  faq: [],
  files: [],
  catalogsByProfile: {
    empresa: [],
    profissional: [],
    pessoal: [],
  },
  faqsByProfile: {
    empresa: [],
    profissional: [],
    pessoal: [],
  },
  promptsByProfile: {
    empresa: "",
    profissional: "",
    pessoal: "",
  },
  filesByProfile: {
    empresa: [],
    profissional: [],
    pessoal: [],
  },
};

export const agentConfigSchema = z.object({
  version: z.number().default(2),
  profile: z.enum(["empresa", "profissional", "pessoal"]).default("empresa"),
  active: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  whatsappInstance: z.string().optional().default(""),
  whatsappPhone: z.string().optional().default(""),
  calendar: z.boolean().default(false),
  calendarName: z.string().default(""),
  ignoreGroups: z.boolean().default(true),
  ignoreStories: z.boolean().default(true),
  contactMode: z.enum(["all", "blacklist", "whitelist"]).default("all"),
  exceptions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
      })
    )
    .default([]),
  pauseOnManual: z.boolean().default(true),
  reactivateHours: z.number().min(1).default(24),
  recentContacts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
        active: z.boolean(),
      })
    )
    .default([]),
  overflow: z
    .object({
      human: z.boolean().default(true),
      unknown: z.boolean().default(true),
      angry: z.boolean().default(true),
      cancellationRefund: z.boolean().default(true),
      phone: z.string().default(""),
      phones: z.array(z.string()).default([]),
    })
    .default({ human: true, unknown: true, angry: true, cancellationRefund: true, phone: "", phones: [] }),
  timezone: z.string().default("America/Sao_Paulo (GMT-03:00)"),
  days: z
    .array(
      z.object({
        name: z.string(),
        open: z.boolean(),
        start: z.string(),
        end: z.string(),
        lunch: z.boolean(),
        lunchStart: z.string(),
        lunchEnd: z.string(),
      })
    )
    .default(initialConfig.days),
  autoHolidays: z.boolean().default(true),
  holidays: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        reason: z.string(),
      })
    )
    .default([]),
  lunchBehavior: z.string().default("Atender e avisar quando a equipe retorna"),
  afterHours: z.enum(afterHoursOptions).default("Atender e agendar, mas avisar que está fechado"),
  awayMessage: z.string().default(initialConfig.awayMessage),
  duration: z.string().default("30 min"),
  durationMode: z.enum(["fixed", "service", "custom"]).default("fixed"),
  customDuration: z.number().min(1).default(30),
  buffer: z.number().min(0).default(10),
  minNotice: z.number().min(0).default(2),
  minAdvanceTime: z.number().min(0).default(2),
  minAdvanceUnit: z.enum(["hours", "days"]).default("hours"),
  maxFuture: z.number().min(1).default(30),
  bookingFields: z.array(z.string()).default(["Nome completo", "Serviço / motivo"]),
  reschedule: z.boolean().default(true),
  agentName: z.string().default(""),
  introduce: z.boolean().default(true),
  discloseAI: z.boolean().default(false),
  goal: z.string().default("Agendamento"),
  goals: z.array(z.string()).default(["Agendamento"]),
  tone: z.string().default("Amigável"),
  tones: z.array(z.string()).default(["Amigável"]),
  responseLength: z.number().min(0).max(100).default(35),
  emojis: z.string().default("Moderado"),
  debounce: z.number().min(0).max(60).default(10),
  splitMessages: z.boolean().default(true),
  typing: z.boolean().default(true),
  audio: z.boolean().default(true),
  images: z.boolean().default(true),
  guardrails: z.array(z.string()).default(initialConfig.guardrails),
  customRules: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .default([]),
  prompt: z.string().default(""),
  profileData: z
    .object({
      company: z.object({
        name: z.string().default(""),
        cnpj: z.string().default(""),
        summary: z.string().default(""),
        address: z.string().default(""),
        online: z.boolean().default(false),
        wifiPassword: z.string().default(""),
        maps: z.string().default(""),
        payments: z.array(z.string()).default([]),
        pix: z.string().default(""),
        links: z.string().default(""),
        additionalInfo: z.string().default(""),
      }),
      professional: z.object({
        name: z.string().default(""),
        registry: z.string().default(""),
        specialty: z.string().default(""),
        address: z.string().default(""),
        links: z.string().default(""),
        payments: z.array(z.string()).default([]),
        additionalInfo: z.string().default(""),
      }),
      personal: z.object({
        name: z.string().default(""),
        summary: z.string().default(""),
        city: z.string().default(""),
        topics: z.string().default(""),
        links: z.string().default(""),
        additionalInfo: z.string().default(""),
      }),
    })
    .default(initialConfig.profileData),
  catalog: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.string(),
        duration: z.string(),
        description: z.string(),
      })
    )
    .default([]),
  faq: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  files: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        size: z.string(),
        uploadedAt: z.string().optional(),
      })
    )
    .default([]),
  catalogsByProfile: z
    .object({
      empresa: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.string(),
          duration: z.string(),
          description: z.string(),
        })
      ),
      profissional: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.string(),
          duration: z.string(),
          description: z.string(),
        })
      ),
      pessoal: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          price: z.string(),
          duration: z.string(),
          description: z.string(),
        })
      ),
    })
    .default(initialConfig.catalogsByProfile),
  faqsByProfile: z
    .object({
      empresa: z.array(
        z.object({
          id: z.string(),
          question: z.string(),
          answer: z.string(),
        })
      ),
      profissional: z.array(
        z.object({
          id: z.string(),
          question: z.string(),
          answer: z.string(),
        })
      ),
      pessoal: z.array(
        z.object({
          id: z.string(),
          question: z.string(),
          answer: z.string(),
        })
      ),
    })
    .default(initialConfig.faqsByProfile),
  promptsByProfile: z
    .object({
      empresa: z.string(),
      profissional: z.string(),
      pessoal: z.string(),
    })
    .default(initialConfig.promptsByProfile),
  filesByProfile: z
    .object({
      empresa: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          size: z.string(),
          uploadedAt: z.string().optional(),
        })
      ),
      profissional: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          size: z.string(),
          uploadedAt: z.string().optional(),
        })
      ),
      pessoal: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          size: z.string(),
          uploadedAt: z.string().optional(),
        })
      ),
    })
    .default(initialConfig.filesByProfile),
});

/**
 * Função segura de parsing e migração da configuração salva no localStorage.
 * Trata dados legados com deep merge e garantia de tipos Zod.
 */
export function safeHydrateConfig(raw: unknown): AgentConfig {
  if (!raw || typeof raw !== "object") {
    return initialConfig;
  }

  const obj = { ...(raw as Record<string, unknown>) };

  // Migração de schema v1 para v2 (onde existia `business` único compartilhado)
  if ("business" in obj && typeof obj.business === "object" && obj.business !== null) {
    const legacyBiz = obj.business as Record<string, unknown>;
    const migratedProfileData = { ...initialConfig.profileData };

    if (obj.profile === "profissional") {
      migratedProfileData.professional.name = String(legacyBiz.name || migratedProfileData.professional.name);
      migratedProfileData.professional.registry = String(legacyBiz.registry || "");
      migratedProfileData.professional.specialty = String(legacyBiz.specialty || "");
      migratedProfileData.professional.address = String(legacyBiz.address || "");
      migratedProfileData.professional.links = String(legacyBiz.links || "");
    } else if (obj.profile === "pessoal") {
      migratedProfileData.personal.name = String(legacyBiz.name || migratedProfileData.personal.name);
      migratedProfileData.personal.summary = String(legacyBiz.summary || "");
      migratedProfileData.personal.city = String(legacyBiz.city || "");
      migratedProfileData.personal.topics = String(legacyBiz.topics || "");
      migratedProfileData.personal.links = String(legacyBiz.links || "");
    } else {
      migratedProfileData.company.name = String(legacyBiz.name || migratedProfileData.company.name);
      migratedProfileData.company.summary = String(legacyBiz.summary || "");
      migratedProfileData.company.address = String(legacyBiz.address || "");
      migratedProfileData.company.online = Boolean(legacyBiz.online);
      migratedProfileData.company.maps = String(legacyBiz.maps || "");
      migratedProfileData.company.pix = String(legacyBiz.pix || "");
      migratedProfileData.company.links = String(legacyBiz.links || "");
    }

    obj.profileData = migratedProfileData;
    delete obj.business;
  }

  // Preenche mapas por perfil caso venham de versão anterior
  const activeProfile = (obj.profile as ProfileType) || "empresa";

  if (!obj.catalogsByProfile || typeof obj.catalogsByProfile !== "object") {
    obj.catalogsByProfile = {
      ...initialConfig.catalogsByProfile,
      [activeProfile]: Array.isArray(obj.catalog) ? obj.catalog : initialConfig.catalogsByProfile[activeProfile],
    };
  }

  if (!obj.faqsByProfile || typeof obj.faqsByProfile !== "object") {
    obj.faqsByProfile = {
      ...initialConfig.faqsByProfile,
      [activeProfile]: Array.isArray(obj.faq) ? obj.faq : initialConfig.faqsByProfile[activeProfile],
    };
  }

  if (!obj.promptsByProfile || typeof obj.promptsByProfile !== "object") {
    obj.promptsByProfile = {
      ...initialConfig.promptsByProfile,
      [activeProfile]: typeof obj.prompt === "string" ? obj.prompt : initialConfig.promptsByProfile[activeProfile],
    };
  }

  if (!obj.filesByProfile || typeof obj.filesByProfile !== "object") {
    obj.filesByProfile = {
      ...initialConfig.filesByProfile,
      [activeProfile]: Array.isArray(obj.files) ? obj.files : initialConfig.filesByProfile[activeProfile],
    };
  }

  // Compatibilidade com múltiplos objetivos e tons
  if (!Array.isArray(obj.goals)) {
    obj.goals = obj.goal ? [String(obj.goal)] : ["Agendamento"];
  }
  if (!Array.isArray(obj.tones)) {
    obj.tones = obj.tone ? [String(obj.tone)] : ["Amigável"];
  }

  // Compatibilidade com overflow (transferência para humano)
  if (obj.overflow && typeof obj.overflow === "object") {
    const ov = obj.overflow as Record<string, unknown>;
    if (typeof ov.cancellationRefund !== "boolean") {
      ov.cancellationRefund = true;
    }
    if (!Array.isArray(ov.phones)) {
      ov.phones = ov.phone ? [String(ov.phone)] : [];
    }
  }

  // Sanitização de comportamento fora de hora caso venha com a opção VIP removida ou inválida
  if (!afterHoursOptions.includes(obj.afterHours as any)) {
    obj.afterHours = initialConfig.afterHours;
  }

  // Sanitização e conversão de buffer para número
  if (typeof obj.buffer === "string") {
    const digits = (obj.buffer as string).replace(/\D/g, "");
    obj.buffer = digits ? Math.max(0, Number(digits)) : 0;
  } else if (typeof obj.buffer !== "number" || isNaN(obj.buffer)) {
    obj.buffer = 10;
  }

  // Sanitização de modo de duração e duração personalizada
  if (obj.durationMode !== "fixed" && obj.durationMode !== "service" && obj.durationMode !== "custom") {
    if (obj.duration === "Por serviço") {
      obj.durationMode = "service";
    } else if (obj.duration === "Personalizado") {
      obj.durationMode = "custom";
    } else {
      obj.durationMode = "fixed";
    }
  }
  if (typeof obj.customDuration !== "number" || isNaN(obj.customDuration) || obj.customDuration < 1) {
    const digits = typeof obj.duration === "string" ? obj.duration.replace(/\D/g, "") : "";
    obj.customDuration = digits ? Number(digits) : 30;
  }

  // Sanitização de antecedência mínima
  if (typeof obj.minAdvanceTime !== "number" || isNaN(obj.minAdvanceTime) || obj.minAdvanceTime < 0) {
    obj.minAdvanceTime = typeof obj.minNotice === "number" ? obj.minNotice : 2;
  }
  if (obj.minAdvanceUnit !== "hours" && obj.minAdvanceUnit !== "days") {
    obj.minAdvanceUnit = "hours";
  }
  if (typeof obj.minNotice !== "number" || isNaN(obj.minNotice)) {
    const advTime = Number(obj.minAdvanceTime) || 2;
    obj.minNotice = obj.minAdvanceUnit === "days" ? advTime * 24 : advTime;
  }

  // Garantia de exclusividade mútua entre apresentar pelo nome e revelar IA
  if (Boolean(obj.introduce) === Boolean(obj.discloseAI)) {
    if (obj.discloseAI) {
      obj.introduce = false;
      obj.discloseAI = true;
    } else {
      obj.introduce = true;
      obj.discloseAI = false;
    }
  }

  // Executa o parse do Zod com fallback seguro
  const parsed = agentConfigSchema.safeParse(obj);
  if (parsed.success) {
    return parsed.data as AgentConfig;
  }

  console.warn("NexusAgent: Falha ao validar dados salvos do localStorage. Utilizando mesclagem resiliente.", parsed.error);
  return {
    ...initialConfig,
    ...(typeof raw === "object" ? (raw as Partial<AgentConfig>) : {}),
    profileData: {
      ...initialConfig.profileData,
      ...((raw as Record<string, unknown>)?.profileData as Record<string, unknown> || {}),
    },
    catalogsByProfile: {
      ...initialConfig.catalogsByProfile,
      ...((raw as Record<string, unknown>)?.catalogsByProfile as Record<string, unknown> || {}),
    },
    faqsByProfile: {
      ...initialConfig.faqsByProfile,
      ...((raw as Record<string, unknown>)?.faqsByProfile as Record<string, unknown> || {}),
    },
    promptsByProfile: {
      ...initialConfig.promptsByProfile,
      ...((raw as Record<string, unknown>)?.promptsByProfile as Record<string, unknown> || {}),
    },
    filesByProfile: {
      ...initialConfig.filesByProfile,
      ...((raw as Record<string, unknown>)?.filesByProfile as Record<string, unknown> || {}),
    },
  };
}

