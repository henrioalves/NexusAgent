import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit2, Search, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow, Badge } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Switch, Checkbox } from "../ui/Controls";
import { maskPhone } from "../../utils/masks";
import { generateUUID } from "../../utils/uuid";
import type { ContactException } from "../../types/agent";

export const AttendanceTab: React.FC = () => {
  const {
    config,
    patchConfig,
    discardNonce,
    requestConfirm,
  } = useAgentConfig();

  // Estados locais para novo contato
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Estado para contato em edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Busca em contatos recentes
  const [searchTerm, setSearchTerm] = useState("");

  // Limpa rascunhos quando o usuário clica em "Descartar"
  useEffect(() => {
    setNewName("");
    setNewPhone("");
    setEditingId(null);
  }, [discardNonce]);

  const handleAddException = () => {
    if (!newName.trim()) {
      toast.error("Preencha o nome do contato.");
      return;
    }
    if (!newPhone.trim()) {
      toast.error("Preencha o telefone do contato.");
      return;
    }

    const newContact: ContactException = {
      id: generateUUID(),
      name: newName.trim(),
      phone: newPhone.trim(),
    };

    patchConfig({
      exceptions: [...config.exceptions, newContact],
    });

    setNewName("");
    setNewPhone("");
    toast.success(`Contato ${newContact.name} adicionado à lista.`);
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

  // Filtro de contatos recentes
  const filteredRecentContacts = useMemo(() => {
    if (!searchTerm.trim()) return config.recentContacts;
    const term = searchTerm.toLowerCase();
    return config.recentContacts.filter(
      (c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    );
  }, [config.recentContacts, searchTerm]);

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

        {/* LISTA DE EXCEÇÕES (BLACKLIST / WHITELIST) */}
        {config.contactMode !== "all" && (
          <div className="list-editor">
            <div className="mb-3 text-xs font-semibold text-gray-700 flex items-center justify-between">
              <span>
                {config.contactMode === "blacklist"
                  ? "Lista de Contatos Bloqueados (Blacklist)"
                  : "Lista de Contatos Permitidos (Whitelist)"}
              </span>
              <span className="text-muted font-normal">
                {config.exceptions.length} contato(s) cadastrado(s)
              </span>
            </div>

            {/* Formulário de Adicionar Contato */}
            <div className="inline-form">
              <Input
                placeholder="Nome do contato"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                placeholder="+55 (00) 00000-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(maskPhone(e.target.value))}
              />
              <Button variant="primary" icon={Plus} onClick={handleAddException}>
                Adicionar
              </Button>
            </div>

            {/* Lista com Edição e Exclusão */}
            <div className="flex flex-col">
              {config.exceptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted border border-dashed rounded-xl mt-2">
                  Nenhum contato na lista de exceções. Adicione contatos no formulário acima.
                </div>
              ) : (
                config.exceptions.map((item) => (
                  <div className="mini-row" key={item.id}>
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
                        <div className="avatar small">
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

      {/* GRID 2 COLUNAS: PAUSA HUMANA & TRANSBORDO */}
      <div className="two-col asym">
        {/* PAUSA HUMANA */}
        <Card
          title="Pausa humana & intervenção"
          subtitle="Evite mensagens duplicadas ou desconexas quando uma pessoa da equipe assumir a conversa."
        >
          <SettingRow
            title="Pausar IA ao responder pelo celular"
            description="Se alguém responder manualmente no WhatsApp, o agente silencia temporariamente."
            control={
              <Switch
                checked={config.pauseOnManual}
                onChange={(v) => patchConfig({ pauseOnManual: v })}
                ariaLabel="Pausar IA ao responder manualmente"
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

          {/* CONTATOS RECENTES COM BUSCA FUNCIONAL */}
          <div className="subsection-title">
            <b>Contatos recentes</b>
            <div className="relative w-48">
              <Input
                placeholder="Buscar por nome ou DDD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs pl-7"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col">
            {filteredRecentContacts.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted">
                Nenhum contato encontrado com o termo "{searchTerm}".
              </div>
            ) : (
              filteredRecentContacts.map((contact) => (
                <div className="mini-row" key={contact.id}>
                  <div className="avatar small">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="grow">
                    <b>{contact.name}</b>
                    <span>{contact.phone}</span>
                  </div>
                  <Badge variant={contact.active ? "success" : "neutral"}>
                    {contact.active ? "IA ativa" : "Pausado"}
                  </Badge>
                  <Switch
                    checked={contact.active}
                    green
                    onChange={(active) => {
                      patchConfig({
                        recentContacts: config.recentContacts.map((item) =>
                          item.id === contact.id ? { ...item, active } : item
                        ),
                      });
                      toast.info(
                        active
                          ? `IA reativada para ${contact.name}`
                          : `IA pausada para ${contact.name}`
                      );
                    }}
                    ariaLabel={`Status de IA para ${contact.name}`}
                  />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* TRANSBORDO HUMANO */}
        <Card
          title="Transbordo humano"
          subtitle="Defina os gatilhos em que o agente deve interromper o fluxo e acionar você."
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
          </div>

          <Field
            label="WhatsApp para receber alertas e chamados"
            hint="Número que receberá a notificação com o resumo da conversa."
          >
            <Input
              placeholder="+55 (00) 00000-0000"
              value={config.overflow.phone}
              onChange={(e) =>
                patchConfig({
                  overflow: { ...config.overflow, phone: maskPhone(e.target.value) },
                })
              }
            />
          </Field>
        </Card>
      </div>
    </div>
  );
};

