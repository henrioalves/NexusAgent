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

export const initialConfig: AgentConfig = {
  version: 2,
  profile: "empresa",
  active: true,
  whatsapp: false,
  whatsappInstance: "nexusmind-main",
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
  overflow: { human: true, unknown: true, angry: true, phone: "" },
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
  buffer: "10 min",
  minNotice: 2,
  maxFuture: 30,
  bookingFields: ["Nome completo", "Serviço / motivo"],
  reschedule: true,
  agentName: "Sofia",
  introduce: true,
  discloseAI: false,
  goal: "Agendamento",
  tone: "Amigável",
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
      summary: "Cuidado integrado com atendimento humano e acolhedor.",
      address: "Av. Paulista, 1000 — São Paulo, SP",
      online: false,
      maps: "https://maps.google.com/?q=Av.+Paulista+1000",
      payments: ["PIX", "Cartão"],
      pix: "financeiro@clinicaaurora.com.br",
      links: "@clinicaaurora",
    },
    professional: {
      name: "Dra. Camila Alencar",
      registry: "CRM/SP 145.890",
      specialty: "Dermatologia & Estética Avançada",
      address: "Rua Oscar Freire, 300 — São Paulo, SP",
      links: "https://dracamila.com.br",
      payments: ["PIX", "Cartão de Crédito", "Transferência"],
    },
    personal: {
      name: "Lucas Mendonça",
      summary: "Consultor de estratégia, palestrante e produtor de conteúdo.",
      city: "São Paulo, SP",
      topics: "Reuniões, palestras, mentorias e projetos de IA.",
      links: "linkedin.com/in/lucas-mendonca",
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
};

export const agentConfigSchema = z.object({
  version: z.number().default(2),
  profile: z.enum(["empresa", "profissional", "pessoal"]).default("empresa"),
  active: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  whatsappInstance: z.string().optional().default("nexusmind-main"),
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
      phone: z.string().default(""),
    })
    .default({ human: true, unknown: true, angry: true, phone: "" }),
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
  afterHours: z.string().default("Atender e agendar, mas avisar que está fechado"),
  awayMessage: z.string().default(initialConfig.awayMessage),
  duration: z.string().default("30 min"),
  buffer: z.string().default("10 min"),
  minNotice: z.number().min(0).default(2),
  maxFuture: z.number().min(1).default(30),
  bookingFields: z.array(z.string()).default(["Nome completo", "Serviço / motivo"]),
  reschedule: z.boolean().default(true),
  agentName: z.string().min(1).default("Sofia"),
  introduce: z.boolean().default(true),
  discloseAI: z.boolean().default(false),
  goal: z.string().default("Agendamento"),
  tone: z.string().default("Amigável"),
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
        summary: z.string().default(""),
        address: z.string().default(""),
        online: z.boolean().default(false),
        maps: z.string().default(""),
        payments: z.array(z.string()).default(["PIX", "Cartão"]),
        pix: z.string().default(""),
        links: z.string().default(""),
      }),
      professional: z.object({
        name: z.string().default("Dra. Camila Alencar"),
        registry: z.string().default(""),
        specialty: z.string().default(""),
        address: z.string().default(""),
        links: z.string().default(""),
        payments: z.array(z.string()).default(["PIX", "Cartão de Crédito"]),
      }),
      personal: z.object({
        name: z.string().default("Lucas Mendonça"),
        summary: z.string().default(""),
        city: z.string().default(""),
        topics: z.string().default(""),
        links: z.string().default(""),
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

  // Executa o parse do Zod com fallback seguro
  const parsed = agentConfigSchema.safeParse(obj);
  if (parsed.success) {
    return parsed.data as AgentConfig;
  }

  console.warn("NexusMind: Falha ao validar dados salvos do localStorage. Utilizando mesclagem resiliente.", parsed.error);
  return {
    ...initialConfig,
    ...(typeof raw === "object" ? (raw as Partial<AgentConfig>) : {}),
    profileData: {
      ...initialConfig.profileData,
      ...((raw as Record<string, unknown>)?.profileData as Record<string, unknown> || {}),
    },
  };
}

