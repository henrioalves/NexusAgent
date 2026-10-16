import { useEffect, useMemo, useState } from "react";

type Profile = "empresa" | "profissional" | "pessoal";
type Tab = "connections" | "contacts" | "schedule" | "identity" | "knowledge";

const uid = () => Math.random().toString(36).slice(2, 9);
const week = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const initialConfig = {
  profile: "empresa" as Profile,
  active: true,
  whatsapp: false,
  calendar: false,
  calendarName: "Agenda principal",
  ignoreGroups: true,
  ignoreStories: true,
  contactMode: "all",
  exceptions: [] as { id: string; name: string; phone: string }[],
  pauseOnManual: true,
  reactivateHours: 24,
  recentContacts: [
    { id: "marina", name: "Marina Costa", phone: "+55 11 98820-1020", active: true },
    { id: "rafael", name: "Rafael Martins", phone: "+55 21 99211-8830", active: false },
    { id: "bianca", name: "Bianca Lima", phone: "+55 11 97750-4421", active: true },
  ],
  overflow: { human: true, unknown: true, angry: true, phone: "" },
  timezone: "America/Sao_Paulo (GMT-03:00)",
  days: week.map((name, index) => ({
    name,
    open: index < 5,
    start: "08:00",
    end: "18:00",
    lunch: index < 5,
    lunchStart: "12:00",
    lunchEnd: "13:30",
  })),
  autoHolidays: true,
  holidays: [{ id: uid(), date: "2025-12-24", reason: "Recesso de fim de ano" }],
  lunchBehavior: "Atender e avisar quando a equipe retorna",
  afterHours: "Atender e agendar, mas avisar que está fechado",
  awayMessage: "Olá! No momento estamos fora do horário, mas retornaremos em breve.",
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
  customRules: [] as { id: string; text: string }[],
  prompt:
    "Receba cada pessoa com atenção, entenda sua necessidade antes de oferecer uma solução e confirme todos os dados antes de agendar.",
  business: {
    name: "Clínica Aurora",
    summary: "Cuidado integrado com atendimento humano e acolhedor.",
    address: "Av. Paulista, 1000 — São Paulo, SP",
    online: false,
    maps: "",
    payments: ["PIX", "Cartão"],
    pix: "",
    links: "@clinicaaurora",
    registry: "",
    specialty: "Atendimento especializado",
    topics: "Rotina, compromissos e informações importantes",
    city: "São Paulo, SP",
  },
  catalog: [
    { id: uid(), name: "Consulta inicial", price: "R$ 250", duration: "50", description: "Avaliação e plano personalizado." },
    { id: uid(), name: "Retorno", price: "R$ 180", duration: "30", description: "Acompanhamento de evolução." },
  ],
  faq: [
    { id: uid(), question: "Vocês atendem aos sábados?", answer: "Sim, mediante agendamento e disponibilidade." },
    { id: uid(), question: "Como posso remarcar?", answer: "Envie seu nome e o melhor novo período para você." },
  ],
  files: [{ id: uid(), name: "Guia-de-atendimento.pdf", size: "1,8 MB" }],
};

type Config = typeof initialConfig;

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    spark: <><path d="M12 3l1.1 4.3L17 9l-3.9 1.7L12 15l-1.1-4.3L7 9l3.9-1.7L12 3Z" /><path d="M5 14l.6 2.4L8 17l-2.4.6L5 20l-.6-2.4L2 17l2.4-.6L5 14Z" /></>,
    plug: <><path d="M8 12l-3 3 4 4 3-3" /><path d="M14 8l3-3M11 5l8 8M16 12l3-3M9 15l6-6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    brain: <><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.3A3.5 3.5 0 0 0 4.5 15 3.5 3.5 0 0 0 9 19.5M14.5 4.5A3.5 3.5 0 0 1 18 8v.3a3.5 3.5 0 0 1 1.5 6.7 3.5 3.5 0 0 1-4.5 4.5M9.5 4.5a3 3 0 0 1 5 0v15a3 3 0 0 1-5 0v-15Z" /><path d="M9.5 9H7M14.5 14H17M9.5 15a3 3 0 0 0-2-1M14.5 8a3 3 0 0 1 2-1" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" /><path d="M8 7h8M8 11h6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    test: <><path d="M8 2v4l-5 9a4 4 0 0 0 3.5 6h11a4 4 0 0 0 3.5-6l-5-9V2M6 6h12M8 14h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

function Button({ children, variant = "secondary", icon, onClick, type = "button", disabled = false, className = "" }: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; className?: string;
}) {
  return <button type={type} className={`btn btn-${variant} ${className}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={16} />}{children}</button>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className || ""}`} />;
}
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input select ${props.className || ""}`}>{children}</select>;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input textarea ${props.className || ""}`} />;
}
function Switch({ checked, onChange, green = false }: { checked: boolean; onChange: (v: boolean) => void; green?: boolean }) {
  return <button type="button" className={`switch ${checked ? "on" : ""} ${green ? "green" : ""}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}><span /></button>;
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
function Card({ title, subtitle, children, className = "", action }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return <section className={`card ${className}`}><div className="card-head"><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function Row({ title, description, control }: { title: string; description?: string; control: React.ReactNode }) {
  return <div className="setting-row"><div><strong>{title}</strong>{description && <p>{description}</p>}</div>{control}</div>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="check"><button type="button" className={checked ? "checked" : ""} onClick={() => onChange(!checked)}>{checked && <Icon name="check" size={13} />}</button><span>{label}</span></label>;
}
function Segmented({ options, value, onChange, compact = false }: { options: string[]; value: string; onChange: (v: string) => void; compact?: boolean }) {
  return <div className={`segmented ${compact ? "compact" : ""}`}>{options.map((o) => <button type="button" key={o} className={value === o ? "selected" : ""} onClick={() => onChange(o)}>{o}</button>)}</div>;
}

const profileLabels: Record<Profile, { label: string; tab: string; title: string; subtitle: string; catalog: string }> = {
  empresa: { label: "Empresa", tab: "Empresa & Conhecimento", title: "Dados da empresa", subtitle: "Contexto institucional usado em cada conversa.", catalog: "Produtos e serviços" },
  profissional: { label: "Profissional", tab: "Meu Perfil & Serviços", title: "Perfil profissional", subtitle: "Credenciais, especialidade e informações de atendimento.", catalog: "Serviços e procedimentos" },
  pessoal: { label: "Pessoal", tab: "Sobre Mim & Contexto", title: "Sobre você", subtitle: "Contexto pessoal para uma assistência realmente útil.", catalog: "Atividades e projetos" },
};

export default function App() {
  const [config, setConfig] = useState<Config>(() => {
    try { return { ...initialConfig, ...JSON.parse(localStorage.getItem("nexusmind-config") || "{}") }; } catch { return initialConfig; }
  });
  const [saved, setSaved] = useState(JSON.stringify(config));
  const [tab, setTab] = useState<Tab>("connections");
  const [modal, setModal] = useState<"qr" | "calendar" | "json" | "wizard" | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [chat, setChat] = useState<{ from: "user" | "agent"; text: string }[]>([
    { from: "agent", text: "Olá! Sou a Sofia. Posso ajudar você com informações ou agendamentos." },
  ]);
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(true);
  const dirty = JSON.stringify(config) !== saved;
  const patch = (value: Partial<Config>) => setConfig((c) => ({ ...c, ...value }));
  const profile = profileLabels[config.profile];

  useEffect(() => {
    if (modal === "qr" || modal === "calendar") setConnecting(true);
  }, [modal]);

  const save = async () => {
    await new Promise((r) => setTimeout(r, 450));
    localStorage.setItem("nexusmind-config", JSON.stringify(config));
    setSaved(JSON.stringify(config));
  };
  const discard = () => setConfig(JSON.parse(saved));
  const sendMessage = () => {
    if (!message.trim()) return;
    const text = message.trim();
    setChat((c) => [...c, { from: "user", text }]);
    setMessage("");
    window.setTimeout(() => {
      const style = config.tone.toLowerCase();
      const reply = `Olá! Eu sou ${config.agentName}. Entendi sua mensagem sobre “${text.slice(0, 42)}${text.length > 42 ? "…" : ""}”. Vou ajudar de forma ${style} e objetiva. ${config.goal === "Agendamento" ? "Qual é o melhor dia e período para você?" : "Pode me contar um pouco mais?"}`;
      setChat((c) => [...c, { from: "agent", text: reply }]);
    }, 700);
  };
  const connect = (kind: "whatsapp" | "calendar") => {
    patch(kind === "whatsapp" ? { whatsapp: true } : { calendar: true });
    setConnecting(false);
    window.setTimeout(() => setModal(null), 700);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "connections", label: "Conexões", icon: "plug" },
    { id: "contacts", label: "Atendimento & Contatos", icon: "users" },
    { id: "schedule", label: "Horários & Agenda", icon: "clock" },
    { id: "identity", label: "Identidade & IA", icon: "brain" },
    { id: "knowledge", label: profile.tab, icon: "book" },
  ];

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-area">
        <button className="brand" onClick={() => setTab("connections")}><span className="brand-mark"><Icon name="spark" size={17} /></span><b>NexusMind</b></button>
        <Button variant="ghost" onClick={() => { setWizardStep(1); setModal("wizard"); }}>Wizard inicial</Button>
        <Button variant="ghost" icon="code" onClick={() => setModal("json")}>Payload JSON</Button>
      </div>
      <Segmented options={["Empresa", "Profissional", "Pessoal"]} value={profile.label} onChange={(v) => patch({ profile: v === "Empresa" ? "empresa" : v === "Profissional" ? "profissional" : "pessoal" })} compact />
      <div className="header-actions">
        <button className="status-chip" onClick={() => !config.whatsapp && setModal("qr")}><span className={config.whatsapp ? "dot online" : "dot"} />WhatsApp</button>
        <button className="status-chip" onClick={() => !config.calendar && setModal("calendar")}><span className={config.calendar ? "dot online" : "dot"} />Agenda</button>
        <button className={`master ${config.active ? "active" : ""}`} onClick={() => patch({ active: !config.active })}><span /><b>{config.active ? "Agente ativo" : "Agente pausado"}</b></button>
        <Button variant="primary" icon="test" onClick={() => setDrawer(true)}>Testar agente</Button>
      </div>
    </header>

    <main>
      <nav className="tabs">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav>
      <div className="page">
        <PageTitle tab={tab} profile={profile} />
        {tab === "connections" && <Connections config={config} patch={patch} setModal={setModal} />}
        {tab === "contacts" && <Contacts config={config} patch={patch} />}
        {tab === "schedule" && <Schedule config={config} patch={patch} />}
        {tab === "identity" && <Identity config={config} patch={patch} />}
        {tab === "knowledge" && <Knowledge config={config} patch={patch} profile={profile} />}
      </div>
    </main>

    {dirty && <div className="savebar"><div><span className="pulse" /><div><b>Você tem alterações não salvas</b><small>Atualize o agente para aplicar as novas regras.</small></div></div><div><Button variant="ghost" onClick={discard}>Descartar</Button><Button variant="primary" onClick={save}>Salvar e atualizar agente</Button></div></div>}
    {modal && <Modal type={modal} close={() => setModal(null)} config={config} patch={patch} connecting={connecting} connect={connect} wizardStep={wizardStep} setWizardStep={setWizardStep} />}
    {drawer && <ChatDrawer config={config} close={() => setDrawer(false)} chat={chat} setChat={setChat} message={message} setMessage={setMessage} send={sendMessage} />}
  </div>;
}

function PageTitle({ tab, profile }: { tab: Tab; profile: typeof profileLabels.empresa }) {
  const copy = {
    connections: ["Conexões e canais", "Gerencie as integrações que dão voz e contexto ao seu agente."],
    contacts: ["Atendimento e contatos", "Defina onde a IA atua e quando uma pessoa deve assumir."],
    schedule: ["Horários e agenda", "Controle disponibilidade, pausas e regras de agendamento."],
    identity: ["Identidade e comportamento", "Dê personalidade, limites e uma voz única ao seu agente."],
    knowledge: [profile.tab, profile.subtitle],
  }[tab];
  return <div className="page-title"><div><span className="eyebrow">Configuração do agente</span><h1>{copy[0]}</h1><p>{copy[1]}</p></div><span className="completion"><b>82%</b> configurado</span></div>;
}

function Connections({ config, patch, setModal }: { config: Config; patch: (v: Partial<Config>) => void; setModal: (v: "qr" | "calendar") => void }) {
  return <div className="two-col">
    <Card className="integration-card" title="WhatsApp" subtitle="Evolution API · Canal obrigatório" action={<div className="integration-icon"><Icon name="phone" /></div>}>
      {config.whatsapp ? <div className="connected-profile"><div className="avatar">NM</div><div className="grow"><b>Atendimento Nexus</b><span>+55 11 99999-9999</span><small>Instância: nexusmind-main</small></div><span className="badge success"><span className="dot online" />Online</span></div> :
      <div className="empty-integration"><p>Conecte seu número para receber mensagens e permitir que o agente responda em tempo real.</p><div className="notice"><span>Canal necessário para publicar o agente</span></div></div>}
      <div className="card-actions">{config.whatsapp ? <Button variant="danger" onClick={() => patch({ whatsapp: false })}>Desconectar WhatsApp</Button> : <><Button variant="primary" onClick={() => setModal("qr")}>Gerar QR Code</Button><Button variant="ghost">Usar código de pareamento</Button></>}</div>
    </Card>
    <Card className="integration-card" title="Google Agenda" subtitle="Google Calendar · Opcional" action={<div className="integration-icon"><Icon name="calendar" /></div>}>
      {config.calendar ? <><div className="connected-profile"><div className="avatar subtle">GC</div><div className="grow"><b>contato@nexusmind.ai</b><span>Conta Google vinculada</span></div><span className="badge success"><span className="dot online" />Sincronizado</span></div><Field label="Agenda ativa"><Select value={config.calendarName} onChange={(e) => patch({ calendarName: e.target.value })}><option>Agenda principal</option><option>Consultório</option><option>Reuniões</option></Select></Field></> :
      <div className="empty-integration"><p>Consulte disponibilidade, crie eventos e permita cancelamentos ou reagendamentos sem intervenção.</p><ul className="benefit-list"><li><Icon name="check" />Consulta horários livres</li><li><Icon name="check" />Agenda automaticamente</li></ul></div>}
      <div className="card-actions">{config.calendar ? <Button variant="danger" onClick={() => patch({ calendar: false })}>Desvincular agenda</Button> : <Button variant="primary" onClick={() => setModal("calendar")}>Conectar Google Calendar</Button>}</div>
    </Card>
  </div>;
}

function Contacts({ config, patch }: { config: Config; patch: (v: Partial<Config>) => void }) {
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  return <div className="stack">
    <Card title="Regras gerais do canal" subtitle="Evite que o agente participe de contextos inadequados.">
      <div className="setting-list"><Row title="Ignorar mensagens de grupos" description="O agente nunca responderá em grupos de WhatsApp." control={<Switch checked={config.ignoreGroups} onChange={(v) => patch({ ignoreGroups: v })} />} /><Row title="Ignorar respostas a Status e Stories" description="Reações e respostas a publicações não iniciam atendimento." control={<Switch checked={config.ignoreStories} onChange={(v) => patch({ ignoreStories: v })} />} /></div>
    </Card>
    <Card title="Modo de operação" subtitle="Escolha quais contatos poderão conversar com a IA.">
      <div className="choice-grid">{[
        ["all", "Responder todos", "A IA atende qualquer pessoa que enviar uma mensagem."],
        ["blacklist", "Todos, exceto selecionados", "Bloqueie contatos específicos da automação."],
        ["whitelist", "Apenas selecionados", "Restrinja a IA a uma lista autorizada."],
      ].map(([id, title, desc]) => <button key={id} className={`choice-card ${config.contactMode === id ? "selected" : ""}`} onClick={() => patch({ contactMode: id })}><span className="radio"><i /></span><b>{title}</b><small>{desc}</small></button>)}</div>
      {config.contactMode !== "all" && <div className="list-editor"><div className="inline-form"><Input placeholder="Nome do contato" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} /><Input placeholder="+55 (00) 00000-0000" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} /><Button variant="primary" icon="plus" onClick={() => { if (newContact.name) { patch({ exceptions: [...config.exceptions, { id: uid(), ...newContact }] }); setNewContact({ name: "", phone: "" }); } }}>Adicionar</Button></div>
        {config.exceptions.map((item) => <div className="mini-row" key={item.id}><div className="avatar small">{item.name.slice(0, 2).toUpperCase()}</div><div className="grow"><b>{item.name}</b><span>{item.phone}</span></div><span className="badge">{config.contactMode === "blacklist" ? "Bloqueado" : "Permitido"}</span><Button variant="ghost" icon="trash" onClick={() => patch({ exceptions: config.exceptions.filter((x) => x.id !== item.id) })} /></div>)}</div>}
    </Card>
    <div className="two-col asym">
      <Card title="Pausa humana & intervenção" subtitle="Evite respostas duplicadas quando você assumir.">
        <Row title="Pausar IA ao responder pelo celular" control={<Switch checked={config.pauseOnManual} onChange={(v) => patch({ pauseOnManual: v })} />} />
        <Field label="Reativar IA automaticamente após"><div className="input-suffix"><Input type="number" value={config.reactivateHours} onChange={(e) => patch({ reactivateHours: +e.target.value })} /><span>horas</span></div></Field>
        <div className="subsection-title"><b>Contatos recentes</b><Input placeholder="Buscar contato" /></div>
        {config.recentContacts.map((r) => <div className="mini-row" key={r.id}><div className="avatar small">{r.name.slice(0, 2).toUpperCase()}</div><div className="grow"><b>{r.name}</b><span>{r.phone}</span></div><span className="badge">{r.active ? "IA ativa" : "Pausado"}</span><Switch checked={r.active} onChange={(active) => patch({ recentContacts: config.recentContacts.map((item) => item.id === r.id ? { ...item, active } : item) })} green /></div>)}
      </Card>
      <Card title="Transbordo humano" subtitle="Quando o agente deve chamar você.">
        <div className="checks">{[["human", "Cliente pediu atendente humano"], ["unknown", "IA não soube responder após 2 tentativas"], ["angry", "Cliente demonstrou irritação ou reclamação"]].map(([key, label]) => <Check key={key} label={label} checked={config.overflow[key as keyof typeof config.overflow] as boolean} onChange={(v) => patch({ overflow: { ...config.overflow, [key]: v } })} />)}</div>
        <Field label="WhatsApp para alertas"><Input placeholder="+55 (00) 00000-0000" value={config.overflow.phone} onChange={(e) => patch({ overflow: { ...config.overflow, phone: e.target.value } })} /></Field>
      </Card>
    </div>
  </div>;
}

function Schedule({ config, patch }: { config: Config; patch: (v: Partial<Config>) => void }) {
  const [holiday, setHoliday] = useState({ date: "", reason: "" });
  const updateDay = (i: number, value: Partial<Config["days"][number]>) => patch({ days: config.days.map((d, n) => n === i ? { ...d, ...value } : d) });
  return <div className="stack">
    <Card title="Fuso horário" subtitle={config.profile === "pessoal" ? "Usado em lembretes e compromissos pessoais." : "Base para horários de atendimento e agendamentos."}><Field label="Fuso principal"><Select value={config.timezone} onChange={(e) => patch({ timezone: e.target.value })}><option>America/Sao_Paulo (GMT-03:00)</option><option>America/Manaus (GMT-04:00)</option><option>America/Rio_Branco (GMT-05:00)</option><option>Europe/Lisbon (GMT+00:00)</option></Select></Field></Card>
    <Card title={config.profile === "pessoal" ? "Grade semanal de disponibilidade" : "Grade de funcionamento semanal"} subtitle="Defina quando o agente considera você ou sua equipe disponível." action={<Button variant="secondary" onClick={() => patch({ days: config.days.map((d, i) => i > 0 && i < 5 ? { ...d, ...config.days[0], name: d.name } : d) })}>Replicar segunda até sexta</Button>}>
      <div className="schedule-list">{config.days.map((day, i) => <div className={`day-row ${!day.open ? "closed" : ""}`} key={day.name}><div className="day-name"><Switch checked={day.open} onChange={(v) => updateDay(i, { open: v })} /><b>{day.name}</b></div>{day.open ? <><Input type="time" value={day.start} onChange={(e) => updateDay(i, { start: e.target.value })} /><span>até</span><Input type="time" value={day.end} onChange={(e) => updateDay(i, { end: e.target.value })} /><label className="lunch"><Switch checked={day.lunch} onChange={(v) => updateDay(i, { lunch: v })} /><span>Pausa</span></label>{day.lunch && <><Input type="time" value={day.lunchStart} onChange={(e) => updateDay(i, { lunchStart: e.target.value })} /><span>até</span><Input type="time" value={day.lunchEnd} onChange={(e) => updateDay(i, { lunchEnd: e.target.value })} /></>} </> : <span className="closed-label">Fechado</span>}</div>)}</div>
    </Card>
    <div className="two-col">
      <Card title="Feriados e datas bloqueadas" subtitle="Crie exceções para períodos sem atendimento.">
        <Row title="Aplicar feriados nacionais" control={<Switch checked={config.autoHolidays} onChange={(v) => patch({ autoHolidays: v })} />} />
        <div className="inline-form compact-form"><Input type="date" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} /><Input placeholder="Motivo ou descrição" value={holiday.reason} onChange={(e) => setHoliday({ ...holiday, reason: e.target.value })} /><Button icon="plus" variant="primary" onClick={() => { if (holiday.date) { patch({ holidays: [...config.holidays, { ...holiday, id: uid() }] }); setHoliday({ date: "", reason: "" }); } }} /></div>
        {config.holidays.map((h) => <div className="mini-row" key={h.id}><div className="date-badge"><b>{h.date.split("-")[2]}</b><span>{h.date.split("-")[1]}/{h.date.split("-")[0]}</span></div><div className="grow"><b>{h.reason}</b><span>Dia inteiro</span></div><Button variant="ghost" icon="trash" onClick={() => patch({ holidays: config.holidays.filter((x) => x.id !== h.id) })} /></div>)}
      </Card>
      <Card title="Comportamento fora de hora" subtitle="Escolha como a IA responde em cada contexto.">
        <Field label="Durante a pausa de almoço"><Select value={config.lunchBehavior} onChange={(e) => patch({ lunchBehavior: e.target.value })}><option>Atender normal sem avisar</option><option>Atender e avisar quando a equipe retorna</option><option>Enviar apenas mensagem fixa</option></Select></Field>
        <Field label="Fora do expediente e em feriados"><Select value={config.afterHours} onChange={(e) => patch({ afterHours: e.target.value })}><option>Atendimento IA 24/7 normal</option><option>Atender e agendar, mas avisar que está fechado</option><option>Enviar mensagem única de ausência</option><option>Ficar totalmente mudo</option></Select></Field>
        {config.afterHours === "Enviar mensagem única de ausência" && <Field label="Mensagem de ausência"><Textarea value={config.awayMessage} onChange={(e) => patch({ awayMessage: e.target.value })} /></Field>}
      </Card>
    </div>
    <Card title="Regras de agendamento" subtitle="Parâmetros usados para oferecer e reservar horários.">
      {!config.calendar && <div className="warning"><Icon name="calendar" /><div><b>Google Agenda ainda não conectado</b><span>Você pode configurar as regras agora e conectar a agenda depois.</span></div></div>}
      <div className="form-grid"><Field label="Duração padrão"><Segmented options={["30 min", "45 min", "1 hora", "Por serviço"]} value={config.duration} onChange={(v) => patch({ duration: v })} /></Field><Field label="Intervalo entre reuniões"><Select value={config.buffer} onChange={(e) => patch({ buffer: e.target.value })}><option>Nenhum</option><option>10 min</option><option>15 min</option><option>30 min</option></Select></Field><Field label="Antecedência mínima"><div className="input-suffix"><Input type="number" value={config.minNotice} onChange={(e) => patch({ minNotice: +e.target.value })} /><span>horas</span></div></Field><Field label="Janela máxima"><div className="input-suffix"><Input type="number" value={config.maxFuture} onChange={(e) => patch({ maxFuture: +e.target.value })} /><span>dias</span></div></Field></div>
      <div className="checks horizontal">{["Nome completo", "CPF", "E-mail", "Serviço / motivo"].map((x) => <Check key={x} label={x} checked={config.bookingFields.includes(x)} onChange={(v) => patch({ bookingFields: v ? [...config.bookingFields, x] : config.bookingFields.filter((y) => y !== x) })} />)}</div>
      <Row title="Permitir cancelamentos e reagendamentos" description="O agente poderá alterar compromissos existentes após confirmar a identidade." control={<Switch checked={config.reschedule} onChange={(v) => patch({ reschedule: v })} />} />
    </Card>
  </div>;
}

function Identity({ config, patch }: { config: Config; patch: (v: Partial<Config>) => void }) {
  const [rule, setRule] = useState("");
  const templates: Record<string, string> = {
    "Clínica / Consultório": "Acolha o paciente, entenda a especialidade desejada e ofereça horários. Não faça diagnósticos. Confirme nome completo e telefone.",
    "Loja / Comércio": "Ajude o cliente a encontrar produtos, consulte o catálogo e informe condições de pagamento. Nunca prometa estoque sem confirmação.",
    "Barbearia / Estética": "Apresente os serviços com clareza, sugira horários e confirme o profissional de preferência antes de agendar.",
    "Escritório / Advocacia": "Realize uma triagem inicial discreta, sem emitir parecer jurídico. Colete área de interesse e urgência.",
    "Uso Pessoal": "Atue como assistente pessoal, organize compromissos e responda de forma breve, gentil e prática.",
  };
  return <div className="stack">
    <div className="two-col">
      <Card title="Identidade e papel" subtitle="Como o agente se apresenta e qual resultado prioriza.">
        <Field label="Nome do agente"><Input value={config.agentName} onChange={(e) => patch({ agentName: e.target.value })} /></Field>
        <Row title="Apresentar-se pelo nome na primeira mensagem" control={<Switch checked={config.introduce} onChange={(v) => patch({ introduce: v })} />} />
        <Row title="Informar que é uma assistente virtual de IA" control={<Switch checked={config.discloseAI} onChange={(v) => patch({ discloseAI: v })} />} />
      </Card>
      <Card title="Personalidade e estilo" subtitle="Ajuste a sensação de cada conversa.">
        <Field label="Tom de voz"><div className="pills">{["Profissional", "Amigável", "Direto", "Descontraído", "Consultivo / Vendedor"].map((x) => <button key={x} className={config.tone === x ? "active" : ""} onClick={() => patch({ tone: x })}>{x}</button>)}</div></Field>
        <Field label="Tamanho das respostas"><div className="range-labels"><span>Curto</span><span>Detalhado</span></div><input className="range" type="range" min="0" max="100" value={config.responseLength} onChange={(e) => patch({ responseLength: +e.target.value })} /></Field>
        <Field label="Uso de emojis"><Segmented options={["Nenhum", "Moderado", "Frequente"]} value={config.emojis} onChange={(v) => patch({ emojis: v })} /></Field>
      </Card>
    </div>
    <Card title="Objetivo principal" subtitle="Oriente a IA para o resultado mais importante."><div className="goal-grid">{["Agendamento", "Tira-dúvidas & Suporte", "Vendas & Conversão", "Qualificação de Leads", "Recepção Pessoal"].map((x) => <button key={x} className={config.goal === x ? "selected" : ""} onClick={() => patch({ goal: x })}><span className="radio"><i /></span><b>{x}</b></button>)}</div></Card>
    <div className="two-col">
      <Card title="Humanização no WhatsApp" subtitle="Comportamentos que tornam a conversa mais natural.">
        <Field label={`Agrupar mensagens picadas · ${config.debounce} segundos`}><input className="range" type="range" min="0" max="30" value={config.debounce} onChange={(e) => patch({ debounce: +e.target.value })} /></Field>
        {[["splitMessages", "Dividir respostas longas em múltiplos balões"], ["typing", "Simular status “Digitando...”"], ["audio", "Ouvir e responder mensagens de áudio"], ["images", "Analisar imagens e comprovantes"]].map(([key, label]) => <Row key={key} title={label} control={<Switch checked={config[key as keyof Config] as boolean} onChange={(v) => patch({ [key]: v })} />} />)}
      </Card>
      <Card title="Guardrails" subtitle="Restrições absolutas que o agente nunca pode violar.">
        <div className="checks">{initialConfig.guardrails.map((g) => <Check key={g} label={g} checked={config.guardrails.includes(g)} onChange={(v) => patch({ guardrails: v ? [...config.guardrails, g] : config.guardrails.filter((x) => x !== g) })} />)}</div>
        <div className="rule-input"><Input placeholder="Adicionar regra proibida personalizada" value={rule} onChange={(e) => setRule(e.target.value)} /><Button icon="plus" variant="primary" onClick={() => { if (rule) { patch({ customRules: [...config.customRules, { id: uid(), text: rule }] }); setRule(""); } }} /></div>
        {config.customRules.map((r) => <div className="custom-rule" key={r.id}><span>{r.text}</span><Button variant="ghost" icon="trash" onClick={() => patch({ customRules: config.customRules.filter((x) => x.id !== r.id) })} /></div>)}
      </Card>
    </div>
    <Card title="Instruções livres" subtitle="Escreva regras, contexto e um roteiro específico para o seu atendimento." action={<Select className="template-select" defaultValue="" onChange={(e) => e.target.value && patch({ prompt: templates[e.target.value] })}><option value="" disabled>Carregar template pronto</option>{Object.keys(templates).map((x) => <option key={x}>{x}</option>)}</Select>}><Textarea className="prompt" value={config.prompt} onChange={(e) => patch({ prompt: e.target.value })} /></Card>
  </div>;
}

function Knowledge({ config, patch, profile }: { config: Config; patch: (v: Partial<Config>) => void; profile: typeof profileLabels.empresa }) {
  const [faq, setFaq] = useState({ question: "", answer: "" });
  const business = config.business;
  const setBusiness = (v: Partial<typeof business>) => patch({ business: { ...business, ...v } });
  return <div className="stack">
    <Card title={profile.title} subtitle={profile.subtitle}>
      {config.profile === "empresa" && <div className="form-grid three"><Field label="Nome fantasia"><Input value={business.name} onChange={(e) => setBusiness({ name: e.target.value })} /></Field><Field label="Endereço físico"><Input value={business.address} disabled={business.online} onChange={(e) => setBusiness({ address: e.target.value })} /></Field><Field label="Google Maps"><Input placeholder="https://maps.google.com/..." value={business.maps} onChange={(e) => setBusiness({ maps: e.target.value })} /></Field><Field label="Resumo do negócio"><Textarea value={business.summary} onChange={(e) => setBusiness({ summary: e.target.value })} /></Field><div><Row title="Operação 100% online" control={<Switch checked={business.online} onChange={(v) => setBusiness({ online: v })} />} /><Field label="Instagram ou site"><Input value={business.links} onChange={(e) => setBusiness({ links: e.target.value })} /></Field></div><div><Field label="Formas de pagamento"><div className="checks horizontal wrap">{["PIX", "Cartão", "Boleto", "Dinheiro"].map((x) => <Check key={x} label={x} checked={business.payments.includes(x)} onChange={(v) => setBusiness({ payments: v ? [...business.payments, x] : business.payments.filter((y) => y !== x) })} />)}</div></Field><Field label="Chave PIX"><Input value={business.pix} onChange={(e) => setBusiness({ pix: e.target.value })} /></Field></div></div>}
      {config.profile === "profissional" && <div className="form-grid three"><Field label="Nome profissional"><Input value={business.name} onChange={(e) => setBusiness({ name: e.target.value })} /></Field><Field label="Registro (CRM, OAB, CRP...)"><Input value={business.registry} onChange={(e) => setBusiness({ registry: e.target.value })} /></Field><Field label="Especialidade"><Input value={business.specialty} onChange={(e) => setBusiness({ specialty: e.target.value })} /></Field><Field label="Endereço de atendimento"><Input value={business.address} onChange={(e) => setBusiness({ address: e.target.value })} /></Field><Field label="Links profissionais"><Input value={business.links} onChange={(e) => setBusiness({ links: e.target.value })} /></Field><Field label="Formas de pagamento"><Input value={business.payments.join(", ")} onChange={(e) => setBusiness({ payments: e.target.value.split(",") })} /></Field></div>}
      {config.profile === "pessoal" && <div className="form-grid three"><Field label="Meu nome"><Input value={business.name} onChange={(e) => setBusiness({ name: e.target.value })} /></Field><Field label="Ocupação / Bio"><Input value={business.summary} onChange={(e) => setBusiness({ summary: e.target.value })} /></Field><Field label="Cidade"><Input value={business.city} onChange={(e) => setBusiness({ city: e.target.value })} /></Field><Field label="Assuntos principais"><Textarea value={business.topics} onChange={(e) => setBusiness({ topics: e.target.value })} /></Field><Field label="Links úteis"><Input value={business.links} onChange={(e) => setBusiness({ links: e.target.value })} /></Field></div>}
    </Card>
    <Card title={profile.catalog} subtitle="Informações estruturadas ajudam o agente a responder com precisão." action={<Button variant="primary" icon="plus" onClick={() => patch({ catalog: [...config.catalog, { id: uid(), name: "Novo item", price: "Sob consulta", duration: "30", description: "" }] })}>Adicionar item</Button>}>
      <div className="table"><div className="table-head"><span>Nome</span><span>Preço</span><span>Duração</span><span>Descrição e preparo</span><span /></div>{config.catalog.map((item) => <div className="table-row" key={item.id}><Input value={item.name} onChange={(e) => patch({ catalog: config.catalog.map((x) => x.id === item.id ? { ...x, name: e.target.value } : x) })} /><Input value={item.price} onChange={(e) => patch({ catalog: config.catalog.map((x) => x.id === item.id ? { ...x, price: e.target.value } : x) })} /><div className="input-suffix"><Input type="number" value={item.duration} onChange={(e) => patch({ catalog: config.catalog.map((x) => x.id === item.id ? { ...x, duration: e.target.value } : x) })} /><span>min</span></div><Input value={item.description} onChange={(e) => patch({ catalog: config.catalog.map((x) => x.id === item.id ? { ...x, description: e.target.value } : x) })} /><Button variant="ghost" icon="trash" onClick={() => patch({ catalog: config.catalog.filter((x) => x.id !== item.id) })} /></div>)}</div>
    </Card>
    <div className="two-col">
      <Card title="FAQ rápido" subtitle="Respostas aprovadas para perguntas recorrentes.">
        {config.faq.map((item) => <details className="faq" key={item.id}><summary><div><small>Quando perguntarem...</small><b>{item.question}</b></div><Icon name="chevron" /></summary><div className="faq-answer"><span>{item.answer}</span><Button variant="ghost" icon="trash" onClick={() => patch({ faq: config.faq.filter((x) => x.id !== item.id) })} /></div></details>)}
        <div className="faq-form"><Input placeholder="Nova pergunta" value={faq.question} onChange={(e) => setFaq({ ...faq, question: e.target.value })} /><Textarea placeholder="Resposta aprovada" value={faq.answer} onChange={(e) => setFaq({ ...faq, answer: e.target.value })} /><Button variant="secondary" icon="plus" onClick={() => { if (faq.question && faq.answer) { patch({ faq: [...config.faq, { ...faq, id: uid() }] }); setFaq({ question: "", answer: "" }); } }}>Adicionar pergunta</Button></div>
      </Card>
      <Card title="Documentos e memória" subtitle="Arquivos usados como fonte pela IA (RAG).">
        <label className="dropzone"><input type="file" accept=".pdf,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) patch({ files: [...config.files, { id: uid(), name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` }] }); }} /><span className="upload-icon"><Icon name="plus" /></span><b>Arraste arquivos ou clique para enviar</b><small>PDF, DOCX ou TXT · até 10 MB cada</small></label>
        {config.files.map((f) => <div className="file-row" key={f.id}><div className="file-icon">DOC</div><div className="grow"><b>{f.name}</b><span>{f.size}</span></div><span className="badge success"><span className="dot online" />Treinado</span><Button variant="ghost" icon="trash" onClick={() => patch({ files: config.files.filter((x) => x.id !== f.id) })} /></div>)}
      </Card>
    </div>
  </div>;
}

function Modal({ type, close, config, patch, connecting, connect, wizardStep, setWizardStep }: { type: string; close: () => void; config: Config; patch: (v: Partial<Config>) => void; connecting: boolean; connect: (k: "whatsapp" | "calendar") => void; wizardStep: number; setWizardStep: (n: number) => void }) {
  return <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><div className={`modal ${type === "json" ? "wide" : ""}`}><div className="modal-head"><div><span className="eyebrow">{type === "wizard" ? "Configuração guiada" : type === "json" ? "Modo desenvolvedor" : "Conectar integração"}</span><h2>{type === "qr" ? "Conectar WhatsApp" : type === "calendar" ? "Google Calendar" : type === "json" ? "Payload da API" : "Seu agente em 1 minuto"}</h2></div><Button variant="ghost" icon="close" onClick={close} /></div>
    {type === "qr" && <div className="connect-modal"><div className="qr"><div className="qr-pattern" /><span className="brand-mark"><Icon name="spark" size={15} /></span></div><h3>Leia o QR Code pelo WhatsApp</h3><p>Abra <b>Aparelhos conectados</b> no celular e aponte a câmera para este código.</p><div className="waiting"><span className={connecting ? "spinner" : "success-check"}>{!connecting && <Icon name="check" />}</span>{connecting ? "Aguardando leitura..." : "WhatsApp conectado!"}</div><Button variant="primary" onClick={() => connect("whatsapp")}>Simular leitura com sucesso</Button></div>}
    {type === "calendar" && <div className="connect-modal"><div className="oauth-icon"><Icon name="calendar" size={30} /></div><h3>Autorizar acesso à agenda</h3><p>O NexusMind poderá consultar disponibilidade, criar, reagendar e cancelar eventos autorizados.</p><div className="permission-list"><span><Icon name="check" />Ver eventos e disponibilidade</span><span><Icon name="check" />Criar e editar compromissos</span></div><Button variant="primary" onClick={() => connect("calendar")}>Continuar com Google</Button></div>}
    {type === "json" && <div><div className="json-toolbar"><p>Estrutura atual pronta para envio ao seu back-end ou workflow n8n.</p><Button variant="secondary" onClick={() => navigator.clipboard?.writeText(JSON.stringify(config, null, 2))}>Copiar JSON</Button></div><pre className="json-view">{JSON.stringify(config, null, 2)}</pre></div>}
    {type === "wizard" && <Wizard config={config} patch={patch} step={wizardStep} setStep={setWizardStep} close={close} />}
  </div></div>;
}

function Wizard({ config, patch, step, setStep, close }: { config: Config; patch: (v: Partial<Config>) => void; step: number; setStep: (n: number) => void; close: () => void }) {
  const templates = ["Atendimento acolhedor", "Vendas consultivas", "Agenda objetiva", "Assistente pessoal"];
  return <div className="wizard"><div className="steps">{[1, 2, 3, 4].map((n) => <span key={n} className={n <= step ? "active" : ""}>{n < step ? <Icon name="check" size={13} /> : n}</span>)}</div>
    {step === 1 && <div className="wizard-body"><span className="step-label">Passo 1 de 4</span><h3>Para quem é este agente?</h3><p>Isso adapta as próximas configurações ao seu contexto.</p><Segmented options={["Empresa", "Profissional", "Pessoal"]} value={profileLabels[config.profile].label} onChange={(v) => patch({ profile: v === "Empresa" ? "empresa" : v === "Profissional" ? "profissional" : "pessoal" })} /><Field label="Nome do agente"><Input value={config.agentName} onChange={(e) => patch({ agentName: e.target.value })} /></Field></div>}
    {step === 2 && <div className="wizard-body"><span className="step-label">Passo 2 de 4</span><h3>Escolha um estilo inicial</h3><p>Você poderá personalizar cada detalhe mais tarde.</p><div className="wizard-options">{templates.map((x) => <button key={x} className={config.prompt.startsWith(x) ? "selected" : ""} onClick={() => patch({ prompt: `${x}: responda com clareza, confirme informações importantes e mantenha o foco na necessidade da pessoa.` })}><span className="radio"><i /></span><b>{x}</b></button>)}</div></div>}
    {step === 3 && <div className="wizard-body center"><span className="step-label">Passo 3 de 4</span><div className="oauth-icon"><Icon name="phone" size={28} /></div><h3>Conecte seu WhatsApp</h3><p>Você pode simular a conexão agora ou fazer isso depois em Conexões.</p>{config.whatsapp ? <span className="badge success">WhatsApp conectado</span> : <Button variant="primary" onClick={() => patch({ whatsapp: true })}>Simular conexão</Button>}</div>}
    {step === 4 && <div className="wizard-body center"><span className="step-label">Passo 4 de 4</span><div className="oauth-icon"><Icon name="calendar" size={28} /></div><h3>Conecte sua agenda</h3><p>Opcional: deixe o agente consultar e reservar horários por você.</p>{config.calendar ? <span className="badge success">Agenda conectada</span> : <Button variant="primary" onClick={() => patch({ calendar: true })}>Conectar agenda</Button>}</div>}
    <div className="wizard-footer"><Button variant="ghost" onClick={() => step === 1 ? close() : setStep(step - 1)}>{step === 1 ? "Agora não" : "Voltar"}</Button><Button variant="primary" onClick={() => step === 4 ? close() : setStep(step + 1)}>{step === 4 ? "Concluir configuração" : "Continuar"}</Button></div>
  </div>;
}

function ChatDrawer({ config, close, chat, setChat, message, setMessage, send }: { config: Config; close: () => void; chat: { from: "user" | "agent"; text: string }[]; setChat: (v: { from: "user" | "agent"; text: string }[]) => void; message: string; setMessage: (v: string) => void; send: () => void }) {
  return <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer"><div className="drawer-head"><div className="avatar agent"><Icon name="spark" /></div><div className="grow"><b>{config.agentName}</b><span><i className="dot online" />Agente disponível</span></div><Button variant="ghost" onClick={() => setChat([])}>Limpar conversa</Button><Button variant="ghost" icon="close" onClick={close} /></div><div className="chat-context"><Icon name="test" size={15} />Ambiente de teste · respostas não serão enviadas</div><div className="messages">{chat.length === 0 && <div className="chat-empty"><Icon name="spark" size={22} /><b>Conversa limpa</b><span>Envie uma mensagem para começar um novo teste.</span></div>}{chat.map((m, i) => <div className={`message ${m.from}`} key={i}><span>{m.text}</span><small>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small></div>)}</div><form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}><Input autoFocus placeholder={`Mensagem para ${config.agentName}...`} value={message} onChange={(e) => setMessage(e.target.value)} /><Button type="submit" variant="primary" icon="send" disabled={!message.trim()} /></form></aside></div>;
}
