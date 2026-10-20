import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, FileText, UploadCloud, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow, Badge } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Switch, Checkbox } from "../ui/Controls";
import { profileMetaRecord } from "../../schemas/agentSchema";
import { generateUUID } from "../../utils/uuid";
import { maskCNPJ } from "../../utils/masks";
import type { CatalogItem, FaqItem, RagFile } from "../../types/agent";

export const KnowledgeBaseTab: React.FC = () => {
  const {
    config,
    patchConfig,
    patchProfileData,
    discardNonce,
    requestConfirm,
  } = useAgentConfig();

  const profileMeta = profileMetaRecord[config.profile];

  // Estados locais para FAQ
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqQuestion, setEditFaqQuestion] = useState("");
  const [editFaqAnswer, setEditFaqAnswer] = useState("");

  // Limpa estados ao descartar
  useEffect(() => {
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    setEditingFaqId(null);
  }, [discardNonce]);

  // Handlers para o Catálogo
  const handleAddCatalogItem = () => {
    const newItem: CatalogItem = {
      id: generateUUID(),
      name: "Novo serviço ou produto",
      price: "R$ 150",
      duration: "30",
      description: "Descrição detalhada do atendimento.",
    };

    patchConfig({
      catalog: [...config.catalog, newItem],
    });
    toast.success("Novo item adicionado ao catálogo.");
  };

  const handleUpdateCatalogItem = (id: string, partial: Partial<CatalogItem>) => {
    patchConfig({
      catalog: config.catalog.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
  };

  const handleDeleteCatalogItem = (item: CatalogItem) => {
    requestConfirm({
      title: "Excluir item do catálogo?",
      message: `Tem certeza que deseja remover "${item.name}"? O agente não poderá mais informar este valor aos clientes.`,
      confirmLabel: "Excluir",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          catalog: config.catalog.filter((x) => x.id !== item.id),
        });
        toast.info(`Item "${item.name}" excluído.`);
      },
    });
  };

  // Handlers para o FAQ
  const handleAddFaq = () => {
    if (!newFaqQuestion.trim()) {
      toast.error("Preencha a pergunta frequente.");
      return;
    }
    if (!newFaqAnswer.trim()) {
      toast.error("Preencha a resposta aprovada.");
      return;
    }

    const newFaq: FaqItem = {
      id: generateUUID(),
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };

    patchConfig({
      faq: [...config.faq, newFaq],
    });

    setNewFaqQuestion("");
    setNewFaqAnswer("");
    toast.success("Pergunta e resposta adicionadas ao FAQ.");
  };

  const handleStartEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setEditFaqQuestion(faq.question);
    setEditFaqAnswer(faq.answer);
  };

  const handleSaveEditFaq = (id: string) => {
    if (!editFaqQuestion.trim() || !editFaqAnswer.trim()) {
      toast.error("Pergunta e resposta não podem ficar vazias.");
      return;
    }

    patchConfig({
      faq: config.faq.map((f) =>
        f.id === id ? { ...f, question: editFaqQuestion.trim(), answer: editFaqAnswer.trim() } : f
      ),
    });

    setEditingFaqId(null);
    toast.success("FAQ atualizado com sucesso!");
  };

  const handleDeleteFaq = (faq: FaqItem) => {
    requestConfirm({
      title: "Excluir pergunta do FAQ?",
      message: `Tem certeza que deseja remover: "${faq.question}"?`,
      confirmLabel: "Excluir",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          faq: config.faq.filter((f) => f.id !== faq.id),
        });
        toast.info("Pergunta removida do FAQ.");
      },
    });
  };

  // Handlers para Upload de Arquivos (RAG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo excede o limite de 10 MB.");
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const newDoc: RagFile = {
      id: generateUUID(),
      name: file.name,
      size: `${sizeMb} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    patchConfig({
      files: [...config.files, newDoc],
    });

    e.target.value = "";
    toast.success(`Documento "${newDoc.name}" indexado à memória da IA!`);
  };

  const handleDeleteFile = (file: RagFile) => {
    requestConfirm({
      title: "Remover documento da memória?",
      message: `O arquivo "${file.name}" será desindexado e o agente não usará mais este conteúdo nas respostas.`,
      confirmLabel: "Remover",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          files: config.files.filter((f) => f.id !== file.id),
        });
        toast.info(`Documento "${file.name}" removido da base.`);
      },
    });
  };

  return (
    <div className="stack">
      {/* CARD 1: FORMULÁRIO ESTRUTURADO ESPECÍFICO POR PERFIL (SEM DATA BLEEDING) */}
      <Card title={profileMeta.title} subtitle={profileMeta.subtitle}>
        {config.profile === "empresa" && (
          <div className="flex flex-col gap-4">
            <div className="form-grid three">
              <Field label="Nome fantasia da empresa">
                <Input
                  value={config.profileData.company.name}
                  onChange={(e) => patchProfileData("company", { name: e.target.value })}
                  placeholder="Ex: Clínica Aurora"
                />
              </Field>

              <Field label="CNPJ da empresa">
                <Input
                  value={config.profileData.company.cnpj || ""}
                  onChange={(e) => patchProfileData("company", { cnpj: maskCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                />
              </Field>

              <Field label="Senha do Wi-Fi (se local físico)" hint="Para informar a visitantes quando perguntarem">
                <Input
                  value={config.profileData.company.wifiPassword || ""}
                  disabled={config.profileData.company.online}
                  onChange={(e) => patchProfileData("company", { wifiPassword: e.target.value })}
                  placeholder="Ex: aurora@2026"
                />
              </Field>

              <Field label="Endereço físico de atendimento">
                <Input
                  value={config.profileData.company.address}
                  disabled={config.profileData.company.online}
                  onChange={(e) => patchProfileData("company", { address: e.target.value })}
                  placeholder="Av. Paulista, 1000 — São Paulo, SP"
                />
              </Field>

              <Field label="Link do Google Maps">
                <Input
                  placeholder="https://maps.google.com/?q=..."
                  value={config.profileData.company.maps}
                  onChange={(e) => patchProfileData("company", { maps: e.target.value })}
                />
              </Field>

              <Field label="Instagram ou Website principal">
                <Input
                  value={config.profileData.company.links}
                  onChange={(e) => patchProfileData("company", { links: e.target.value })}
                  placeholder="@suaempresa ou https://seusite.com.br"
                />
              </Field>

              <Field label="Resumo institucional do negócio">
                <Textarea
                  value={config.profileData.company.summary}
                  onChange={(e) => patchProfileData("company", { summary: e.target.value })}
                  placeholder="Descreva em poucas linhas o propósito e diferencial da sua empresa..."
                />
              </Field>

              <div>
                <SettingRow
                  title="Operação 100% online"
                  description="Desativa endereço físico caso você não atenda presencialmente."
                  control={
                    <Switch
                      checked={config.profileData.company.online}
                      onChange={(online) => patchProfileData("company", { online })}
                      ariaLabel="Operação online"
                    />
                  }
                />
              </div>

              <div>
                <Field label="Formas de pagamento aceitas">
                  <div className="checks horizontal wrap">
                    {["PIX", "Cartão", "Boleto", "Dinheiro"].map((payment) => (
                      <Checkbox
                        key={payment}
                        label={payment}
                        checked={config.profileData.company.payments.includes(payment)}
                        onChange={(checked) => {
                          const payments = config.profileData.company.payments;
                          const next = checked
                            ? [...payments, payment]
                            : payments.filter((p) => p !== payment);
                          patchProfileData("company", { payments: next });
                        }}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Chave Pix Principal para envio automático" className="mt-2">
                  <Input
                    value={config.profileData.company.pix}
                    onChange={(e) => patchProfileData("company", { pix: e.target.value })}
                    placeholder="financeiro@empresa.com.br ou CNPJ"
                  />
                </Field>
              </div>
            </div>

            {/* Informações Adicionais / Regras da Casa */}
            <Field
              label="Informações Adicionais / Regras da Casa"
              hint="Regras rápidas, particularidades e orientações sem necessidade de upload de PDF."
            >
              <Textarea
                value={config.profileData.company.additionalInfo || ""}
                onChange={(e) => patchProfileData("company", { additionalInfo: e.target.value })}
                placeholder="Ex: Estacionamento conveniado no número 1020 com 50% de desconto. Não é permitida a entrada com animais de grande porte..."
                rows={3}
              />
            </Field>
          </div>
        )}

        {config.profile === "profissional" && (
          <div className="flex flex-col gap-4">
            <div className="form-grid three">
              <Field label="Nome profissional completo">
                <Input
                  value={config.profileData.professional.name}
                  onChange={(e) => patchProfileData("professional", { name: e.target.value })}
                  placeholder="Ex: Dra. Camila Alencar"
                />
              </Field>

              <Field label="Registro profissional (CRM, OAB, CRP...)">
                <Input
                  value={config.profileData.professional.registry}
                  onChange={(e) => patchProfileData("professional", { registry: e.target.value })}
                  placeholder="Ex: CRM/SP 123.456"
                />
              </Field>

              <Field label="Especialidade de atuação">
                <Input
                  value={config.profileData.professional.specialty}
                  onChange={(e) => patchProfileData("professional", { specialty: e.target.value })}
                  placeholder="Ex: Psicologia Clínica ou Direito Tributário"
                />
              </Field>

              <Field label="Endereço do consultório / escritório">
                <Input
                  value={config.profileData.professional.address}
                  onChange={(e) => patchProfileData("professional", { address: e.target.value })}
                  placeholder="Rua Oscar Freire, 300 — Sala 42"
                />
              </Field>

              <Field label="Links profissionais (Linktree, LinkedIn, Site)">
                <Input
                  value={config.profileData.professional.links}
                  onChange={(e) => patchProfileData("professional", { links: e.target.value })}
                  placeholder="https://meusite.com.br"
                />
              </Field>

              <Field label="Formas de pagamento aceitas (separadas por vírgula)">
                <Input
                  value={config.profileData.professional.payments.join(", ")}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean);
                    patchProfileData("professional", { payments: arr });
                  }}
                  placeholder="PIX, Cartão, Transferência"
                />
              </Field>
            </div>

            {/* Informações Adicionais / Regras da Casa */}
            <Field
              label="Informações Adicionais / Regras da Casa"
              hint="Regras rápidas, particularidades e orientações sem necessidade de upload de PDF."
            >
              <Textarea
                value={config.profileData.professional.additionalInfo || ""}
                onChange={(e) => patchProfileData("professional", { additionalInfo: e.target.value })}
                placeholder="Ex: Cancelamentos com menos de 24h de antecedência cobram taxa de remarcação. Chegar com 10 min de antecedência para preenchimento de ficha..."
                rows={3}
              />
            </Field>
          </div>
        )}

        {config.profile === "pessoal" && (
          <div className="flex flex-col gap-4">
            <div className="form-grid three">
              <Field label="Meu nome de apresentação">
                <Input
                  value={config.profileData.personal.name}
                  onChange={(e) => patchProfileData("personal", { name: e.target.value })}
                  placeholder="Ex: Lucas Mendonça"
                />
              </Field>

              <Field label="Cidade / Localização base">
                <Input
                  value={config.profileData.personal.city}
                  onChange={(e) => patchProfileData("personal", { city: e.target.value })}
                  placeholder="São Paulo, SP"
                />
              </Field>

              <Field label="Links úteis (Agenda, Portfólio)">
                <Input
                  value={config.profileData.personal.links}
                  onChange={(e) => patchProfileData("personal", { links: e.target.value })}
                  placeholder="linkedin.com/in/seunome"
                />
              </Field>

              <Field label="Resumo / Bio pessoal">
                <Textarea
                  value={config.profileData.personal.summary}
                  onChange={(e) => patchProfileData("personal", { summary: e.target.value })}
                  placeholder="Explique sua atuação, projetos atuais ou contexto para filtrar mensagens..."
                />
              </Field>

              <Field label="Tópicos e assuntos prioritários">
                <Textarea
                  value={config.profileData.personal.topics}
                  onChange={(e) => patchProfileData("personal", { topics: e.target.value })}
                  placeholder="Reuniões, mentorias, palestras, convites para podcasts..."
                />
              </Field>
            </div>

            {/* Informações Adicionais / Regras da Casa */}
            <Field
              label="Informações Adicionais / Regras da Casa"
              hint="Regras rápidas, particularidades e orientações sem necessidade de upload de PDF."
            >
              <Textarea
                value={config.profileData.personal.additionalInfo || ""}
                onChange={(e) => patchProfileData("personal", { additionalInfo: e.target.value })}
                placeholder="Ex: Prefiro reuniões virtuais pelo Google Meet. Não atendo chamadas sem aviso prévio por WhatsApp..."
                rows={3}
              />
            </Field>
          </div>
        )}
      </Card>

      {/* CARD 2: CATÁLOGO DE PRODUTOS / SERVIÇOS COM EDIÇÃO COMPLETA */}
      <Card
        title={profileMeta.catalog}
        subtitle="Informações estruturadas permitem ao agente responder sobre preços, prazos e condições com precisão milimétrica."
        action={
          <Button variant="primary" icon={Plus} onClick={handleAddCatalogItem}>
            Adicionar item
          </Button>
        }
      >
        <div className="table">
          <div className="table-head">
            <span>Nome do item</span>
            <span>Preço</span>
            <span>Duração</span>
            <span>Descrição e orientações de preparo</span>
            <span />
          </div>

          {config.catalog.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              Nenhum serviço ou produto cadastrado. Clique em "Adicionar item" acima.
            </div>
          ) : (
            config.catalog.map((item) => (
              <div className="table-row" key={item.id}>
                <Input
                  value={item.name}
                  onChange={(e) => handleUpdateCatalogItem(item.id, { name: e.target.value })}
                  placeholder="Nome do serviço ou produto"
                />
                <Input
                  value={item.price}
                  onChange={(e) => handleUpdateCatalogItem(item.id, { price: e.target.value })}
                  placeholder="Ex: R$ 250 ou Sob consulta"
                />
                <div className="input-suffix">
                  <Input
                    type="number"
                    min={5}
                    value={item.duration}
                    onChange={(e) =>
                      handleUpdateCatalogItem(item.id, {
                        duration: String(Math.max(1, Number(e.target.value) || 1)),
                      })
                    }
                    placeholder="30"
                  />
                  <span>min</span>
                </div>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateCatalogItem(item.id, { description: e.target.value })
                  }
                  placeholder="Orientações e detalhes..."
                />
                <Button
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => handleDeleteCatalogItem(item)}
                  className="px-2 text-red-500 hover:text-red-700"
                  title="Excluir item"
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 2 COLUNAS: FAQ RÁPIDO & MEMÓRIA RAG */}
      <div className="two-col">
        {/* FAQ RÁPIDO */}
        <Card
          title="FAQ Rápido (Perguntas e Respostas)"
          subtitle="Respostas padronizadas para as dúvidas mais frequentes dos seus clientes."
          action={<HelpCircle size={18} className="text-muted" />}
        >
          <div className="flex flex-col">
            {config.faq.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted border border-dashed rounded-xl mb-3">
                Nenhuma pergunta frequente cadastrada ainda.
              </div>
            ) : (
              config.faq.map((faq) => {
                const isEditing = editingFaqId === faq.id;

                if (isEditing) {
                  return (
                    <div className="p-3 bg-gray-50 border rounded-xl mb-2 flex flex-col gap-2" key={faq.id}>
                      <Input
                        value={editFaqQuestion}
                        onChange={(e) => setEditFaqQuestion(e.target.value)}
                        placeholder="Pergunta"
                        className="text-xs"
                      />
                      <Textarea
                        value={editFaqAnswer}
                        onChange={(e) => setEditFaqAnswer(e.target.value)}
                        placeholder="Resposta"
                        rows={2}
                        className="text-xs"
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          icon={X}
                          onClick={() => setEditingFaqId(null)}
                          className="h-7 text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          icon={Check}
                          onClick={() => handleSaveEditFaq(faq.id)}
                          className="h-7 text-xs"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <details className="faq" key={faq.id}>
                    <summary>
                      <div>
                        <small>Quando perguntarem:</small>
                        <b>{faq.question}</b>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          icon={Edit2}
                          onClick={(e) => {
                            e.preventDefault();
                            handleStartEditFaq(faq);
                          }}
                          className="px-2"
                          title="Editar pergunta"
                        />
                      </div>
                    </summary>
                    <div className="faq-answer">
                      <span>{faq.answer}</span>
                      <Button
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleDeleteFaq(faq)}
                        className="px-2 text-red-500 hover:text-red-700"
                        title="Excluir pergunta"
                      />
                    </div>
                  </details>
                );
              })
            )}
          </div>

          {/* FORMULÁRIO DE ADIÇÃO DE FAQ */}
          <div className="faq-form mt-3">
            <Input
              placeholder="Nova pergunta (ex: Aceitam convênio médico?)"
              value={newFaqQuestion}
              onChange={(e) => setNewFaqQuestion(e.target.value)}
            />
            <Textarea
              placeholder="Resposta aprovada que o agente deve repassar..."
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              rows={2}
            />
            <Button variant="secondary" icon={Plus} onClick={handleAddFaq}>
              Adicionar pergunta ao FAQ
            </Button>
          </div>
        </Card>

        {/* DOCUMENTOS E MEMÓRIA (RAG) */}
        <Card
          title="Documentos e Memória (RAG)"
          subtitle="Arquivos utilizados como fonte rica de conhecimento para a IA responder com profundidade."
          action={<FileText size={18} className="text-muted" />}
        >
          <label className="dropzone group">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
            />
            <span className="upload-icon group-hover:scale-105 transition-transform">
              <UploadCloud size={20} />
            </span>
            <b>Arraste arquivos ou clique para enviar</b>
            <small>PDF, DOCX ou TXT · até 10 MB cada documento</small>
          </label>

          <div className="flex flex-col mt-3">
            {config.files.length === 0 ? (
              <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-1 text-muted border border-dashed border-neutral-200/80 rounded-xl">
                <FileText size={20} className="text-neutral-300 mb-0.5" />
                <span className="text-xs font-medium text-neutral-600">
                  Nenhum documento treinado
                </span>
                <span className="text-[11px] text-neutral-400">
                  Arraste ou selecione arquivos acima para anexar à memória da IA.
                </span>
              </div>
            ) : (
              config.files.map((file) => (
                <div className="file-row" key={file.id}>
                  <div className="file-icon">DOC</div>
                  <div className="grow">
                    <b>{file.name}</b>
                    <span>{file.size}</span>
                  </div>
                  <Badge variant="success" dot>
                    Treinado
                  </Badge>
                  <Button
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleDeleteFile(file)}
                    className="px-2 text-red-500 hover:text-red-700"
                    title="Remover documento"
                  />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

