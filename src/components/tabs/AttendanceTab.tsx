import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, Search, Check, X, ShieldAlert, Users, PhoneCall, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow, Badge } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Switch, Checkbox } from "../ui/Controls";
import { maskPhone } from "../../utils/masks";
import type { ContactException } from "../../types/agent";
import { SelectWhatsAppContactsModal } from "./SelectWhatsAppContactsModal";

export const AttendanceTab: React.FC = () => {
  const {
    config,
    patchConfig,
    discardNonce,
    requestConfirm,
  } = useAgentConfig();

  // Modal de seleção visual de contatos do WhatsApp
  const [isSelectContactsModalOpen, setIsSelectContactsModalOpen] = useState(false);

  // Estado para contato em edição (exceções)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Busca e filtro de contatos recentes
  const [searchTerm, setSearchTerm] = useState("");
  const [recentFilter, setRecentFilter] = useState<"24h" | "all">("24h");

  // Estado para input de tags de telefones de alerta
  const [newAlertPhone, setNewAlertPhone] = useState("");

  // Limpa rascunhos quando o usuário clica em "Descartar"
  useEffect(() => {
    setEditingId(null);
    setNewAlertPhone("");
  }, [discardNonce]);

  // Lista atual de telefones de alerta (com fallback compatível)
  const alertPhones: string[] = useMemo(() => {
    if (config.overflow.phones && config.overflow.phones.length > 0) {
      return config.overflow.phones;
    }
    return config.overflow.phone ? [config.overflow.phone] : [];
  }, [config.overflow.phones, config.overflow.phone]);

  const handleAddAlertPhone = () => {
    const raw = newAlertPhone.trim();
    if (!raw) return;
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Informe um número de WhatsApp válido com DDD.");
      return;
    }

    if (alertPhones.includes(raw)) {
      toast.warning("Este número já está na lista de alertas.");
      return;
    }

    const nextPhones = [...alertPhones, raw];
    patchConfig({
      overflow: {
        ...config.overflow,
        phones: nextPhones,
        phone: nextPhones[0] || "",
      },
    });
    setNewAlertPhone("");
    toast.success("Número adicionado à lista de alertas.");
  };

  const handleRemoveAlertPhone = (phoneToRemove: string) => {
    const nextPhones = alertPhones.filter((p) => p !== phoneToRemove);
    patchConfig({
      overflow: {
        ...config.overflow,
        phones: nextPhones,
        phone: nextPhones[0] || "",
      },
    });
    toast.info("Número removido dos alertas.");
  };

  // Callback ao adicionar múltiplos contatos selecionados no Modal
  const handleAddContactsFromModal = (newContacts: ContactException[]) => {
    const existingPhones = new Set(
      config.exceptions.map((ex) => ex.phone.replace(/\D/g, ""))
    );
    const uniqueToAdd = newContacts.filter(
      (c) => !existingPhones.has(c.phone.replace(/\D/g, ""))
    );

    if (uniqueToAdd.length === 0) {
      toast.info("Os contatos selecionados já estavam na lista.");
      return;
    }

    patchConfig({
      exceptions: [...config.exceptions, ...uniqueToAdd],
    });
    toast.success(
      `${uniqueToAdd.length} contato(s) adicionado(s) com sucesso à lista!`
    );
  };

  const handleStartEdit = (contact: ContactException) => {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      toast.error("O nome do contato não pode ficar vazio.");
      return;
    }

    patchConfig({
      exceptions: config.exceptions.map((item) =>
        item.id === id ? { ...item, name: editName.trim(), phone: editPhone.trim() } : item
      ),
    });

    setEditingId(null);
    toast.success("Contato atualizado com sucesso!");
  };

  const handleDeleteException = (contact: ContactException) => {
    requestConfirm({
      title: "Remover contato da lista?",
      message: `Tem certeza que deseja remover ${contact.name} (${contact.phone})?`,
      confirmLabel: "Remover",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          exceptions: config.exceptions.filter((x) => x.id !== contact.id),
        });
        toast.info(`Contato ${contact.name} removido.`);
      },
    });
  };

  // Filtro de contatos recentes com suporte a busca e "Últimas 24h"
  const filteredRecentContacts = useMemo(() => {
    let list = config.recentContacts;

    // Em uma aplicação real, a flag de 24h seria baseada no timestamp do contato.
    // Aqui garantimos visualmente a experiência mantendo os contatos mais recentes.
    if (recentFilter === "24h") {
      // Simulação: exibe os contatos das últimas 24 horas (primeiros ou ativos)
      list = config.recentContacts.slice(0, 5);
    }

    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    );
  }, [config.recentContacts, searchTerm, recentFilter]);

  const handleToggleContactIA = (id: string, active: boolean, name: string) => {
    patchConfig({
      recentContacts: config.recentContacts.map((item) =>
        item.id === id ? { ...item, active } : item
      ),
    });
    toast.info(
      active
        ? `IA reativada para ${name}`
        : `IA pausada para ${name}. Responda manualmente pelo WhatsApp.`
    );
  };

  return (
    <div className="stack">
      {/* CARD 1: REGRAS GERAIS DO CANAL */}
      <Card
        title="Regras gerais do canal"
        subtitle="Evite que o agente participe de contextos inadequados ou conversas públicas."
      >
        <div className="setting-list">
          <SettingRow
            title="Ignorar mensagens de grupos"
            description="O agente nunca responderá nem interagirá em grupos de WhatsApp."
            control={
              <Switch
                checked={config.ignoreGroups}
                onChange={(v) => patchConfig({ ignoreGroups: v })}
                ariaLabel="Ignorar mensagens de grupos"
              />
            }
          />
          <SettingRow
            title="Ignorar respostas a Status e Stories"
            description="Reações e respostas a publicações visuais não iniciarão atendimento de IA."
            control={
              <Switch
                checked={config.ignoreStories}
                onChange={(v) => patchConfig({ ignoreStories: v })}
                ariaLabel="Ignorar respostas a status"
              />
            }
          />
        </div>
      </Card>

      {/* CARD 2: MODO DE OPERAÇÃO */}
      <Card
        title="Modo de operação"
        subtitle="Escolha quais contatos poderão conversar com o agente de IA."
      >
        <div className="choice-grid">
          {[
            ["all", "Responder todos", "A IA atende qualquer pessoa que enviar uma mensagem."],
            ["blacklist", "Todos, exceto selecionados", "Bloqueie contatos específicos da automação."],
            ["whitelist", "Apenas selecionados", "Restrinja a IA a uma lista autorizada de contatos."],
          ].map(([id, title, desc]) => {
            const isSelected = config.contactMode === id;
            return (
              <button
                type="button"
                key={id}
                className={`choice-card ${isSelected ? "selected" : ""}`}
                onClick={() => patchConfig({ contactMode: id as "all" | "blacklist" | "whitelist" })}
              >
                <span className="radio">
                  <i />
                </span>
                <b>{title}</b>
                <small>{desc}</small>
              </button>
            );
          })}
        </div>

        {/* LISTA DE EXCEÇÕES (BLACKLIST / WHITELIST) COM SELEÇÃO VISUAL */}
        {config.contactMode !== "all" && (
          <div className="list-editor">
            <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-neutral-800 m-0">
                  {config.contactMode === "blacklist"
                    ? "Lista de Contatos Bloqueados (Blacklist)"
                    : "Lista de Contatos Permitidos (Whitelist)"}
                </h3>
                <span className="text-[11px] text-muted">
                  {config.exceptions.length} contato(s) cadastrado(s)
                </span>
              </div>

              {/* Botão de seleção visual simulando WhatsApp */}
              <Button
                variant="primary"
                icon={Users}
                onClick={() => setIsSelectContactsModalOpen(true)}
                className="text-xs h-9 px-3.5 shadow-sm"
              >
                Selecionar Contatos do WhatsApp
              </Button>
            </div>

            {/* Lista com Edição e Exclusão */}
            <div className="flex flex-col border border-neutral-200/80 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white">
              {config.exceptions.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-muted">
                    <Users size={18} />
                  </div>
                  <p className="text-xs text-muted max-w-sm m-0">
                    Nenhum contato na lista de exceções. Clique no botão acima para selecionar contatos sincronizados do WhatsApp.
                  </p>
                </div>
              ) : (
                config.exceptions.map((item) => (
                  <div className="mini-row px-3 py-2.5" key={item.id}>
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nome"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={editPhone}
                          onChange={(e) => setEditPhone(maskPhone(e.target.value))}
                          placeholder="Telefone"
                          className="h-8 text-xs"
                        />
                        <Button
                          variant="primary"
                          icon={Check}
                          onClick={() => handleSaveEdit(item.id)}
                          className="h-8 px-2"
                        />
                        <Button
                          variant="ghost"
                          icon={X}
                          onClick={() => setEditingId(null)}
                          className="h-8 px-2"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="avatar small font-semibold">
                          {item.name.slice(0, 2).toUpperCase() || "CT"}
                        </div>
                        <div className="grow">
                          <b>{item.name}</b>
                          <span>{item.phone}</span>
                        </div>
                        <Badge variant={config.contactMode === "blacklist" ? "danger" : "success"}>
                          {config.contactMode === "blacklist" ? "Bloqueado" : "Autorizado"}
                        </Badge>
                        <Button
                          variant="ghost"
                          icon={Edit2}
                          onClick={() => handleStartEdit(item)}
                          className="px-2"
                          title="Editar contato"
                        />
                        <Button
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => handleDeleteException(item)}
                          className="px-2 text-red-500 hover:text-red-700"
                          title="Remover contato"
                        />
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Card>

      {/* GRID 2 COLUNAS: PAUSA HUMANA & TRANSFERÊNCIA PARA HUMANO */}
      <div className="two-col asym">
        {/* PAUSA HUMANA */}
        <Card
          title="Pausa humana & intervenção"
          subtitle="Evite mensagens duplicadas ou desconexas quando uma pessoa da equipe assumir a conversa."
        >
          <SettingRow
            title="Pausar IA por resposta humana"
            description="Se alguém responder manualmente no WhatsApp, o agente silencia temporariamente para não atropelar a conversa."
            control={
              <Switch
                checked={config.pauseOnManual}
                onChange={(v) => patchConfig({ pauseOnManual: v })}
                ariaLabel="Pausar IA por resposta humana"
              />
            }
          />

          <Field
            label="Reativar IA automaticamente após"
            hint="Tempo de inatividade humana até que o robô volte a atender aquele contato."
          >
            <Input
              type="number"
              min={1}
              value={config.reactivateHours}
              suffix="horas"
              onChange={(e) => {
                const val = Math.max(1, Number(e.target.value) || 1);
                patchConfig({ reactivateHours: val });
              }}
            />
          </Field>

          {/* CONTATOS RECENTES COM FILTRO DE 24H E AÇÕES RÁPIDAS */}
          <div className="subsection-title">
            <div className="flex items-center gap-2">
              <b>Contatos recentes</b>
              <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRecentFilter("24h")}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    recentFilter === "24h"
                      ? "bg-white text-black shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Últimas 24h
                </button>
                <button
                  type="button"
                  onClick={() => setRecentFilter("all")}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    recentFilter === "all"
                      ? "bg-white text-black shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="relative w-44">
              <Input
                placeholder="Buscar contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs pl-7"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col border border-neutral-200/80 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white mt-2.5">
            {filteredRecentContacts.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted">
                Nenhum contato recente registrado no período.
              </div>
            ) : (
              filteredRecentContacts.map((contact) => (
                <div className="mini-row px-3 py-2.5" key={contact.id}>
                  <div className="avatar small font-medium">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="grow">
                    <div className="flex items-center gap-1.5">
                      <b>{contact.name}</b>
                      {recentFilter === "24h" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                          <Clock size={10} /> recente
                        </span>
                      )}
                    </div>
                    <span>{contact.phone}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge variant={contact.active ? "success" : "neutral"}>
                    {contact.active ? "Ativo" : "Pausado"}
                  </Badge>

                  {/* Botão rápido de Pausar / Retomar IA */}
                  {contact.active ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleToggleContactIA(contact.id, false, contact.name)}
                      className="h-7 px-2.5 text-xs text-neutral-600 hover:text-black font-medium border border-neutral-200"
                    >
                      Pausar IA
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleToggleContactIA(contact.id, true, contact.name)}
                      className="h-7 px-2.5 text-xs font-medium"
                    >
                      Retomar IA
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* TRANSFERÊNCIA PARA HUMANO */}
        <Card
          title="Transferência para Humano"
          subtitle="Defina os gatilhos em que o agente deve interromper o fluxo e acionar você ou sua equipe."
          action={<ShieldAlert size={18} className="text-muted" />}
        >
          <div className="checks">
            <Checkbox
              label="Cliente solicitou atendente humano expressamente"
              checked={config.overflow.human}
              onChange={(v) =>
                patchConfig({
                  overflow: { ...config.overflow, human: v },
                })
              }
            />
            <Checkbox
              label="IA não soube responder a dúvida após 2 tentativas"
              checked={config.overflow.unknown}
              onChange={(v) =>
                patchConfig({
                  overflow: { ...config.overflow, unknown: v },
                })
              }
            />
            <Checkbox
              label="Cliente demonstrou irritação, urgência ou reclamação"
              checked={config.overflow.angry}
              onChange={(v) =>
                patchConfig({
                  overflow: { ...config.overflow, angry: v },
                })
              }
            />
            <Checkbox
              label="Intenção de Cancelamento ou Reembolso"
              checked={config.overflow.cancellationRefund ?? true}
              onChange={(v) =>
                patchConfig({
                  overflow: { ...config.overflow, cancellationRefund: v },
                })
              }
            />
          </div>

          {/* Campo de WhatsApp com suporte a MÚLTIPLOS números (Tag input) */}
          <Field
            label="WhatsApp para receber alertas e chamados (Múltiplos números)"
            hint="Adicione os números da equipe que receberão a notificação e o link da conversa."
            className="mt-3"
          >
            {/* Input para adicionar nova tag de telefone */}
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="+55 (00) 00000-0000"
                value={newAlertPhone}
                onChange={(e) => setNewAlertPhone(maskPhone(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAlertPhone();
                  }
                }}
                className="h-9 text-xs"
              />
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleAddAlertPhone}
                className="h-9 text-xs px-3"
              >
                Adicionar
              </Button>
            </div>

            {/* Container visual de tags de telefones */}
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-neutral-50/80 border border-neutral-200/80 rounded-xl">
              {alertPhones.length === 0 ? (
                <span className="text-xs text-muted self-center px-1">
                  Nenhum número cadastrado. Digite um WhatsApp e clique em Adicionar.
                </span>
              ) : (
                alertPhones.map((phone) => (
                  <span
                    key={phone}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-white text-neutral-800 border border-neutral-200/90 shadow-2xs"
                  >
                    <PhoneCall size={12} className="text-neutral-500" />
                    <span>{phone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlertPhone(phone)}
                      className="w-4 h-4 rounded-full inline-flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-colors"
                      title="Remover número"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </Field>
        </Card>
      </div>

      {/* Modal de seleção de contatos */}
      <SelectWhatsAppContactsModal
        isOpen={isSelectContactsModalOpen}
        onClose={() => setIsSelectContactsModalOpen(false)}
        contactMode={config.contactMode === "blacklist" ? "blacklist" : "whitelist"}
        existingExceptions={config.exceptions}
        onAddContacts={handleAddContactsFromModal}
      />
    </div>
  );
};
