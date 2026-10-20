import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Shield, Bot, MessageSquare, Check } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow, Slider } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Switch, Checkbox, SegmentedControl } from "../ui/Controls";
import { generateUUID } from "../../utils/uuid";
import { initialConfig } from "../../schemas/agentSchema";

export const IdentityTab: React.FC = () => {
  const { config, patchConfig, discardNonce, requestConfirm } = useAgentConfig();
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    setNewRule("");
  }, [discardNonce]);

  const handleAddCustomRule = () => {
    if (!newRule.trim()) {
      toast.error("Escreva a regra proibida personalizada antes de adicionar.");
      return;
    }

    patchConfig({
      customRules: [...config.customRules, { id: generateUUID(), text: newRule.trim() }],
    });

    setNewRule("");
    toast.success("Regra proibida adicionada com sucesso.");
  };

  const handleDeleteRule = (id: string, text: string) => {
    requestConfirm({
      title: "Remover regra proibida?",
      message: `Tem certeza que deseja remover: "${text}"?`,
      confirmLabel: "Remover",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          customRules: config.customRules.filter((r) => r.id !== id),
        });
        toast.info("Regra proibida removida.");
      },
    });
  };

  const toneOptions = [
    "Profissional",
    "Amigável",
    "Empático / Acolhedor",
    "Direto",
    "Descontraído",
    "Consultivo / Vendedor",
  ];

  const goalOptions = [
    "Agendamento",
    "Tira-dúvidas & Suporte",
    "Vendas & Conversão",
    "Qualificação de Leads",
    "Recepção Pessoal",
  ];

  // Recupera array de tons de voz ativos (com fallback)
  const currentTones: string[] =
    config.tones && config.tones.length > 0
      ? config.tones
      : config.tone
      ? [config.tone]
      : ["Amigável"];

  const handleToggleTone = (tone: string) => {
    let nextTones: string[];
    if (currentTones.includes(tone)) {
      if (currentTones.length === 1) {
        toast.info("O agente precisa ter pelo menos um tom de voz ativo.");
        return;
      }
      nextTones = currentTones.filter((t) => t !== tone);
    } else {
      nextTones = [...currentTones, tone];
    }

    patchConfig({
      tones: nextTones,
      tone: nextTones[0] || "Amigável",
    });
  };

  // Recupera array de objetivos principais ativos (com fallback)
  const currentGoals: string[] =
    config.goals && config.goals.length > 0
      ? config.goals
      : config.goal
      ? [config.goal]
      : ["Agendamento"];

  const handleToggleGoal = (goal: string) => {
    let nextGoals: string[];
    if (currentGoals.includes(goal)) {
      if (currentGoals.length === 1) {
        toast.info("O agente precisa ter pelo menos um objetivo selecionado.");
        return;
      }
      nextGoals = currentGoals.filter((g) => g !== goal);
    } else {
      nextGoals = [...currentGoals, goal];
    }

    patchConfig({
      goals: nextGoals,
      goal: nextGoals[0] || "Agendamento",
    });
  };

  // Exclusividade mútua entre apresentar pelo nome e declarar assistente de IA
  const handleToggleIntroduce = (active: boolean) => {
    if (active) {
      patchConfig({ introduce: true, discloseAI: false });
    } else {
      // Se tentar desativar a opção ativa, alterna automaticamente para a outra
      patchConfig({ introduce: false, discloseAI: true });
    }
  };

  const handleToggleDiscloseAI = (active: boolean) => {
    if (active) {
      patchConfig({ discloseAI: true, introduce: false });
    } else {
      // Se tentar desativar a opção ativa, alterna automaticamente para a outra
      patchConfig({ discloseAI: false, introduce: true });
    }
  };

  return (
    <div className="stack">
      {/* 2 COLUNAS: IDENTIDADE & PERSONALIDADE */}
      <div className="two-col">
        {/* IDENTIDADE E PAPEL */}
        <Card
          title="Identidade e papel"
          subtitle="Defina como o agente se apresenta e se sua natureza de IA é revelada."
          action={<Bot size={18} className="text-muted" />}
        >
          <Field label="Nome do agente">
            <Input
              value={config.agentName}
              onChange={(e) => patchConfig({ agentName: e.target.value })}
              placeholder="Ex: Sofia, Lucas, Atendente Nexus"
            />
          </Field>

          <SettingRow
            title="Apresentar-se pelo nome na primeira mensagem"
            description="Ex: 'Olá! Sou a Sofia da Clínica Aurora...'"
            control={
              <Switch
                checked={config.introduce}
                onChange={handleToggleIntroduce}
                ariaLabel="Apresentar-se pelo nome"
              />
            }
          />

          <SettingRow
            title="Informar explicitamente que é uma assistente de IA"
            description="Adiciona transparência conforme diretrizes éticas e de compliance."
            control={
              <Switch
                checked={config.discloseAI}
                onChange={handleToggleDiscloseAI}
                ariaLabel="Informar que é IA"
              />
            }
          />
        </Card>

        {/* PERSONALIDADE E ESTILO */}
        <Card
          title="Personalidade e estilo"
          subtitle="Ajuste o tom das mensagens para combinar perfeitamente com a sua marca."
          action={<Sparkles size={18} className="text-muted" />}
        >
          <Field
            label="Tom de voz (Permite seleção múltipla)"
            hint="Selecione um ou mais estilos para balancear as respostas do robô."
          >
            <div className="pills">
              {toneOptions.map((tone) => {
                const isSelected = currentTones.includes(tone);
                return (
                  <button
                    type="button"
                    key={tone}
                    className={isSelected ? "active font-medium" : "font-normal"}
                    onClick={() => handleToggleTone(tone)}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Tamanho padrão das respostas">
            <Slider
              value={config.responseLength}
              min={10}
              max={100}
              step={5}
              leftLabel="Curto & Direto"
              rightLabel="Detalhado & Explicativo"
              onChange={(responseLength) => patchConfig({ responseLength })}
            />
          </Field>

          <Field label="Uso de emojis nas mensagens">
            <SegmentedControl
              options={["Nenhum", "Moderado", "Frequente"]}
              value={config.emojis}
              onChange={(emojis) => patchConfig({ emojis })}
            />
          </Field>
        </Card>
      </div>

      {/* OBJETIVO PRINCIPAL */}
      <Card
        title="Objetivo principal do agente"
        subtitle="Oriente a IA para priorizar a conversão mais relevante. Permite selecionar múltiplos objetivos."
      >
        <div className="goal-grid">
          {goalOptions.map((goal) => {
            const isSelected = currentGoals.includes(goal);
            return (
              <button
                type="button"
                key={goal}
                className={`choice-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggleGoal(goal)}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <span
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-black border-black text-white"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </span>
                  <b className="text-xs">{goal}</b>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2 COLUNAS: HUMANIZAÇÃO & REGRAS PROIBIDAS */}
      <div className="two-col">
        {/* HUMANIZAÇÃO NO WHATSAPP */}
        <Card
          title="Humanização no WhatsApp"
          subtitle="Comportamentos que tornam a conversa natural e imperceptível como bot."
          action={<MessageSquare size={18} className="text-muted" />}
        >
          <Field
            label="Agrupamento de mensagens picadas (Debounce)"
            hint="Aguarda o cliente parar de digitar antes de gerar a resposta."
          >
            <Slider
              value={config.debounce}
              min={3}
              max={30}
              step={1}
              leftLabel="3s (Rápido)"
              rightLabel="30s (Mais calmo)"
              unit="segundos"
              onChange={(debounce) => patchConfig({ debounce })}
            />
          </Field>

          <div className="setting-list mt-2">
            <SettingRow
              title="Dividir respostas longas em múltiplos balões"
              description="Evita enviar blocos grandes de texto em uma só mensagem."
              control={
                <Switch
                  checked={config.splitMessages}
                  onChange={(v) => patchConfig({ splitMessages: v })}
                  ariaLabel="Dividir respostas em balões"
                />
              }
            />

            <SettingRow
              title="Simular status 'Digitando...' e 'Gravando áudio...'"
              description="Exibe o indicador no WhatsApp durante o processamento da resposta."
              control={
                <Switch
                  checked={config.typing}
                  onChange={(v) => patchConfig({ typing: v })}
                  ariaLabel="Simular digitando"
                />
              }
            />

            <SettingRow
              title="Transcrever e responder mensagens de voz"
              description="Converte áudios dos clientes em texto e responde normalmente."
              control={
                <Switch
                  checked={config.audio}
                  onChange={(v) => patchConfig({ audio: v })}
                  ariaLabel="Processar áudios"
                />
              }
            />

            <SettingRow
              title="Analisar imagens e fotos de comprovantes"
              description="Utiliza visão computacional para ler fotos e documentos recebidos."
              control={
                <Switch
                  checked={config.images}
                  onChange={(v) => patchConfig({ images: v })}
                  ariaLabel="Processar imagens"
                />
              }
            />
          </div>
        </Card>

        {/* REGRAS PROIBIDAS */}
        <Card
          title="Regras Proibidas"
          subtitle="Restrições invioláveis que a IA nunca pode quebrar em nenhuma circunstância."
          action={<Shield size={18} className="text-muted" />}
        >
          <div className="checks">
            {initialConfig.guardrails.map((rule) => (
              <Checkbox
                key={rule}
                label={rule}
                checked={config.guardrails.includes(rule)}
                onChange={(checked) => {
                  const next = checked
                    ? [...config.guardrails, rule]
                    : config.guardrails.filter((r) => r !== rule);
                  patchConfig({ guardrails: next });
                }}
              />
            ))}
          </div>

          <div className="rule-input">
            <Input
              placeholder="Adicionar regra proibida personalizada..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomRule();
                }
              }}
            />
            <Button variant="primary" icon={Plus} onClick={handleAddCustomRule}>
              Adicionar
            </Button>
          </div>

          <div className="flex flex-col mt-2">
            {config.customRules.map((rule) => (
              <div className="custom-rule" key={rule.id}>
                <span>{rule.text}</span>
                <Button
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => handleDeleteRule(rule.id, rule.text)}
                  className="px-2 text-red-500 hover:text-red-700"
                  title="Remover regra"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* INSTRUÇÕES LIVRES */}
      <Card
        title="Instruções Livres"
        subtitle="Escreva regras específicas, roteiro de atendimento, tom institucional e particularidades do seu nicho."
      >
        <Textarea
          className="prompt"
          value={config.prompt}
          onChange={(e) => patchConfig({ prompt: e.target.value })}
          placeholder="Ex: Receba cada cliente com gentileza, pergunte o motivo do contato e ofereça nossos horários..."
        />
      </Card>
    </div>
  );
};
