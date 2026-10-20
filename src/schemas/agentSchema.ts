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
  whatsappInstance: "NexusAgent-main",
  whatsappPhone: "+55 11 99999-9999",
  calendar: false,
  calendarName: "Agenda principal",
  ignoreGroups: true,
  ignoreStories: true,
  contactMode: "all",
  exceptions: [],
  pauseOnManual: true,
  reactivateHours: 24,
  recentContacts: [
    { id: "marina", name: "Marina Costa", phone: "+55 11 98820-1020", active: true },
    { id: "rafael", name: "Rafael Martins", phone: "+55 21 99211-8830", active: false },
    { id: "bianca", name: "Bianca Lima", phone: "+55 11 97750-4421", active: true },
  ],
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
  holidays: [{ id: generateUUID(), date: "2026-12-24", reason: "Recesso de fim de ano" }],
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
  agentName: "Sofia",
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
  prompt: "Receba cada pessoa com atenção, entenda sua necessidade antes de oferecer uma solução e confirme todos os dados antes de agendar.",
  profileData: {
    company: {
      name: "Clínica Aurora",
      cnpj: "12.345.678/0001-90",
      summary: "Cuidado integrado com atendimento humano e acolhedor.",
      address: "Av. Paulista, 1000 — São Paulo, SP",
      online: false,
      wifiPassword: "",
      maps: "https://maps.google.com/?q=Av.+Paulista+1000",
      payments: ["PIX", "Cartão"],
      pix: "financeiro@clinicaaurora.com.br",
      links: "@clinicaaurora",
      additionalInfo: "",
    },
    professional: {
      name: "Dra. Camila Alencar",
      registry: "CRM/SP 145.890",
      specialty: "Dermatologia & Estética Avançada",
      address: "Rua Oscar Freire, 300 — São Paulo, SP",
      links: "https://dracamila.com.br",
      payments: ["PIX", "Cartão de Crédito", "Transferência"],
      additionalInfo: "",
    },
    personal: {
      name: "Lucas Mendonça",
      summary: "Consultor de estratégia, palestrante e produtor de conteúdo.",
      city: "São Paulo, SP",
      topics: "Reuniões, palestras, mentorias e projetos de IA.",
      links: "linkedin.com/in/lucas-mendonca",
      additionalInfo: "",
    },
  },
  catalog: [
    {
      id: generateUUID(),
      name: "Consulta inicial",
      price: "R$ 250",
      duration: "50",
      description: "Avaliação inicial completa e montagem do plano personalizado.",
    },
    {
      id: generateUUID(),
      name: "Retorno",
      price: "R$ 180",
      duration: "30",
      description: "Acompanhamento da evolução e ajuste de conduta.",
    },
  ],
  faq: [
    {
      id: generateUUID(),
      question: "Vocês atendem aos sábados?",
      answer: "Sim, atendemos aos sábados das 08h às 12h mediante agendamento prévio.",
    },
    {
      id: generateUUID(),
      question: "Como posso remarcar meu horário?",
      answer: "Basta nos enviar seu nome completo e o período de sua preferência para localizarmos novas opções.",
    },
  ],
  files: [{ id: generateUUID(), name: "Guia-de-atendimento.pdf", size: "1.8 MB", uploadedAt: "2026-10-10" }],
  catalogsByProfile: {
    empresa: [
      {
        id: generateUUID(),
        name: "Consulta inicial",
        price: "R$ 250",
        duration: "50",
        description: "Avaliação inicial completa e montagem do plano personalizado.",
      },
      {
        id: generateUUID(),
        name: "Retorno",
        price: "R$ 180",
        duration: "30",
        description: "Acompanhamento da evolução e ajuste de conduta.",
      },
    ],
    profissional: [
      {
        id: generateUUID(),
        name: "Consulta Especializada",
        price: "R$ 350",
        duration: "60",
        description: "Atendimento técnico individual com avaliação detalhada.",
      },
      {
        id: generateUUID(),
        name: "Sessão de Acompanhamento",
        price: "R$ 220",
        duration: "45",
        description: "Revisão e evolução do plano de atendimento.",
      },
    ],
    pessoal: [
      {
        id: generateUUID(),
        name: "Reunião de Alinhamento",
        price: "Gratuito",
        duration: "30",
        description: "Alinhamento rápido de projetos e prioridades.",
      },
      {
        id: generateUUID(),
        name: "Mentoria / Café Estratégico",
        price: "Sob consulta",
        duration: "60",
        description: "Conversa aprofundada sobre oportunidades e parcerias.",
      },
    ],
  },
  faqsByProfile: {
    empresa: [
      {
        id: generateUUID(),
        question: "Vocês atendem aos sábados?",
        answer: "Sim, atendemos aos sábados das 08h às 12h mediante agendamento prévio.",
      },
      {
        id: generateUUID(),
        question: "Como posso remarcar meu horário?",
        answer: "Basta nos enviar seu nome completo e o período de sua preferência para localizarmos novas opções.",
      },
    ],
    profissional: [
      {
        id: generateUUID(),
        question: "Atende por convênio ou plano de saúde?",
        answer: "Trabalhamos com atendimento particular e emitimos recibo detalhado para pedido de reembolso junto ao seu plano.",
      },
      {
        id: generateUUID(),
        question: "Onde fica o consultório / escritório?",
        answer: "Nosso endereço e detalhes de acesso estão disponíveis no perfil profissional ou via link do Google Maps.",
      },
    ],
    pessoal: [
      {
        id: generateUUID(),
        question: "Como agendar uma reunião ou call?",
        answer: "Envie sua disponibilidade e o assunto principal para eu consultar a agenda e encaminhar o link do Google Meet.",
      },
      {
        id: generateUUID(),
        question: "Como tratar assuntos urgentes?",
        answer: "Informe se o assunto é urgente para que eu notifique diretamente e priorize o contato.",
      },
    ],
  },
  promptsByProfile: {
    empresa:
      "Receba cada cliente com energia e entusiasmo. Ajude a encontrar produtos através do catálogo e informe com precisão preços e formas de pagamento aceitas. Nunca prometa produtos esgotados sem confirmação da equipe.",
    profissional:
      "Acolha cada paciente de forma atenciosa e empática. Entenda a especialidade e queixa antes de oferecer horários. Nunca dê diagnósticos nem prescreva medicamentos. Colete nome completo e confirme o horário com antecedência.",
    pessoal:
      "Atue como meu assistente executivo pessoal. Responda de forma direta, gentil e prestativa. Anote recados importantes, confirme datas para reuniões e filtre mensagens de baixa prioridade.",
  },
  filesByProfile: {
    empresa: [{ id: generateUUID(), name: "Guia-de-atendimento.pdf", size: "1.8 MB", uploadedAt: "2026-10-10" }],
    profissional: [{ id: generateUUID(), name: "Termo-de-atendimento.pdf", size: "1.2 MB", uploadedAt: "2026-10-10" }],
    pessoal: [{ id: generateUUID(), name: "Bio-e-diretrizes.pdf", size: "0.8 MB", uploadedAt: "2026-10-10" }],
  },
};

export const agentConfigSchema = z.object({
  version: z.number().default(2),
  profile: z.enum(["empresa", "profissional", "pessoal"]).default("empresa"),
  active: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  whatsappInstance: z.string().optional().default("NexusAgent-main"),
  whatsappPhone: z.string().optional().default("+55 11 99999-9999"),
  calendar: z.boolean().default(false),
  calendarName: z.string().default("Agenda principal"),
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
  agentName: z.string().min(1).default("Sofia"),
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
  prompt: z.string().default(initialConfig.prompt),
  profileData: z
    .object({
      company: z.object({
        name: z.string().default("Clínica Aurora"),
        cnpj: z.string().default(""),
        summary: z.string().default(""),
        address: z.string().default(""),
        online: z.boolean().default(false),
        wifiPassword: z.string().default(""),
        maps: z.string().default(""),
        payments: z.array(z.string()).default(["PIX", "Cartão"]),
        pix: z.string().default(""),
        links: z.string().default(""),
        additionalInfo: z.string().default(""),
      }),
      professional: z.object({
        name: z.string().default("Dra. Camila Alencar"),
        registry: z.string().default(""),
        specialty: z.string().default(""),
        address: z.string().default(""),
        links: z.string().default(""),
        payments: z.array(z.string()).default(["PIX", "Cartão de Crédito"]),
        additionalInfo: z.string().default(""),
      }),
      personal: z.object({
        name: z.string().default("Lucas Mendonça"),
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

