import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Shield, Bot, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow, Slider } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Input";
import { Switch, Checkbox, SegmentedControl } from "../ui/Controls";
import { generateUUID } from "../../utils/uuid";
import { initialConfig } from "../../schemas/agentSchema";

const promptTemplates: Record<string, string> = {
  "Clínica / Consultório":
    "Acolha cada paciente de forma atenciosa e empática. Entenda a especialidade e queixa antes de oferecer horários. Nunca dê diagnósticos nem prescreva medicamentos. Colete nome completo e confirme o horário com antecedência.",
  "Loja / Comércio":
    "Receba os clientes com energia e entusiasmo. Ajude a encontrar produtos através do catálogo e informe com precisão preços e formas de pagamento aceitas. Nunca prometa produtos esgotados sem confirmação da equipe.",
  "Barbearia / Estética":
    "Apresente os serviços e procedimentos disponíveis com clareza. Pergunte a preferência de profissional antes de sugerir horários na grade. Confirme tolerância de atraso e formas de pagamento aceitas.",
  "Escritório / Advocacia":
    "Realize uma triagem inicial discreta e profissional. Colete a área jurídica de interesse, urgência e dados de contato. Nunca emita pareceres jurídicos definitivos antes da consulta formal com o advogado.",
  "Uso Pessoal":
    "Atue como meu assistente executivo pessoal. Responda de forma direta, gentil e prestativa. Anote recados importantes, confirme datas para reuniões e filtre mensagens de baixa prioridade.",
};

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
    toast.success("Regra proibida adicionada aos Guardrails.");
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

  const handleApplyTemplate = (templateName: string) => {
    if (!templateName) return;
    const templateContent = promptTemplates[templateName];
    if (templateContent) {
      patchConfig({ prompt: templateContent });
      toast.success(`Template "${templateName}" carregado nas instruções.`);
    }
  };

  const toneOptions = [
    "Profissional",
    "Amigável",
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
                onChange={(v) => patchConfig({ introduce: v })}
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
                onChange={(v) => patchConfig({ discloseAI: v })}
                ariaLabel="Informar que é IA"
              />
            }
          />
        </Card>

        {/* PERSONALIDADE E ESTILO */}
        <Card
          title="Personalidade e estilo"
          subtitle="Ajuste o tom das mensagens para combinar com a sua marca."
          action={<Sparkles size={18} className="text-muted" />}
        >
          <Field label="Tom de voz">
            <div className="pills">
              {toneOptions.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  className={config.tone === tone ? "active" : ""}
                  onClick={() => patchConfig({ tone })}
                >
                  {tone}
                </button>
              ))}
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
        subtitle="Oriente a IA para priorizar a conversão mais relevante para o seu negócio."
      >
        <div className="goal-grid">
          {goalOptions.map((goal) => {
            const isSelected = config.goal === goal;
            return (
              <button
                type="button"
                key={goal}
                className={isSelected ? "selected" : ""}
                onClick={() => patchConfig({ goal })}
              >
                <span className="radio">
                  <i />
                </span>
                <b>{goal}</b>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2 COLUNAS: HUMANIZAÇÃO & GUARDRAILS */}
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

        {/* GUARDRAILS (RESTRIÇÕES ABSOLUTAS) */}
        <Card
          title="Guardrails (Regras Proibidas)"
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

      {/* PROMPT LIVRE E TEMPLATES */}
      <Card
        title="Instruções Livres (System Prompt)"
        subtitle="Escreva regras específicas, roteiro de atendimento, tom institucional e particularidades do seu nicho."
        action={
          <Select
            className="template-select"
            defaultValue=""
            onChange={(e) => {
              handleApplyTemplate(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Carregar template pronto...
            </option>
            {Object.keys(promptTemplates).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        }
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

