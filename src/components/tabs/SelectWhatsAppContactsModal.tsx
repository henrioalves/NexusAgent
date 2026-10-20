import React, { useState, useMemo } from "react";
import { Search, UserPlus, Check, Plus, MessageSquare } from "lucide-react";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/LayoutCards";
import { maskPhone } from "../../utils/masks";
import { generateUUID } from "../../utils/uuid";
import type { ContactException } from "../../types/agent";

export interface SelectWhatsAppContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactMode: "whitelist" | "blacklist";
  existingExceptions: ContactException[];
  onAddContacts: (contacts: ContactException[]) => void;
}

interface MockWhatsAppContact {
  id: string;
  name: string;
  phone: string;
  recentActivity: string;
}

const mockWhatsAppContacts: MockWhatsAppContact[] = [
  { id: "wa-1", name: "Camila Ramos", phone: "+55 (11) 98765-4321", recentActivity: "Hoje às 14:20" },
  { id: "wa-2", name: "Rodrigo Silva", phone: "+55 (11) 97123-4567", recentActivity: "Hoje às 12:45" },
  { id: "wa-3", name: "Fernanda Souza", phone: "+55 (21) 98888-1122", recentActivity: "Hoje às 09:10" },
  { id: "wa-4", name: "Lucas Oliveira", phone: "+55 (31) 99234-5678", recentActivity: "Ontem" },
  { id: "wa-5", name: "Amanda Duarte", phone: "+55 (11) 96543-2109", recentActivity: "Ontem" },
  { id: "wa-6", name: "Carlos Eduardo", phone: "+55 (41) 98456-7890", recentActivity: "18/10/2026" },
  { id: "wa-7", name: "Mariana Fonseca", phone: "+55 (19) 97321-6540", recentActivity: "18/10/2026" },
  { id: "wa-8", name: "Gabriel Santos", phone: "+55 (11) 99112-3344", recentActivity: "17/10/2026" },
  { id: "wa-9", name: "Juliana Menezes", phone: "+55 (81) 98711-2233", recentActivity: "16/10/2026" },
  { id: "wa-10", name: "Marcelo Peixoto", phone: "+55 (61) 98223-4455", recentActivity: "15/10/2026" },
  { id: "wa-11", name: "Beatriz Castro", phone: "+55 (11) 96677-8899", recentActivity: "14/10/2026" },
  { id: "wa-12", name: "Thiago Moreira", phone: "+55 (71) 99345-6789", recentActivity: "12/10/2026" },
];

export const SelectWhatsAppContactsModal: React.FC<SelectWhatsAppContactsModalProps> = ({
  isOpen,
  onClose,
  contactMode,
  existingExceptions,
  onAddContacts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Conjunto de telefones já presentes na lista para evitar duplicidade
  const existingPhones = useMemo(() => {
    return new Set(
      existingExceptions.map((ex) => ex.phone.replace(/\D/g, ""))
    );
  }, [existingExceptions]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return mockWhatsAppContacts;
    const term = searchTerm.toLowerCase();
    const digits = term.replace(/\D/g, "");
    return mockWhatsAppContacts.filter((c) => {
      const matchName = c.name.toLowerCase().includes(term);
      const matchPhone = digits ? c.phone.replace(/\D/g, "").includes(digits) : false;
      return matchName || matchPhone;
    });
  }, [searchTerm]);

  const toggleSelect = (id: string, isAlreadyAdded: boolean) => {
    if (isAlreadyAdded) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAllVisible = () => {
    const next = new Set(selectedIds);
    filteredContacts.forEach((c) => {
      const phoneDigits = c.phone.replace(/\D/g, "");
      if (!existingPhones.has(phoneDigits)) {
        next.add(c.id);
      }
    });
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const contactsToAdd: ContactException[] = [];

    // Contatos selecionados da lista
    mockWhatsAppContacts.forEach((c) => {
      if (selectedIds.has(c.id)) {
        contactsToAdd.push({
          id: generateUUID(),
          name: c.name,
          phone: c.phone,
        });
      }
    });

    // Contato manual se preenchido
    if (showManualForm && manualName.trim() && manualPhone.trim()) {
      contactsToAdd.push({
        id: generateUUID(),
        name: manualName.trim(),
        phone: manualPhone.trim(),
      });
    }

    if (contactsToAdd.length > 0) {
      onAddContacts(contactsToAdd);
    }

    // Reset
    setSelectedIds(new Set());
    setSearchTerm("");
    setManualName("");
    setManualPhone("");
    setShowManualForm(false);
    onClose();
  };

  const modeLabel = contactMode === "blacklist" ? "Bloqueados (Blacklist)" : "Permitidos (Whitelist)";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Contatos do WhatsApp"
      eyebrow="Sincronização WhatsApp"
      subtitle={`Escolha contatos sincronizados da sua conta para a lista de ${modeLabel}.`}
      maxWidth="wide"
    >
      <div className="flex flex-col gap-4 pt-1">
        {/* Barra de busca e ações rápidas */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nome ou telefone no WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm"
              autoFocus
            />
            <Search size={15} className="absolute left-3 top-3 text-muted pointer-events-none" />
          </div>
          <Button
            variant={showManualForm ? "secondary" : "ghost"}
            icon={Plus}
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-xs"
          >
            {showManualForm ? "Fechar manual" : "Digitar número"}
          </Button>
        </div>

        {/* Formulário manual expansível caso o número não esteja na lista recente */}
        {showManualForm && (
          <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col sm:flex-row gap-2.5 items-end">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Nome do contato
              </label>
              <Input
                placeholder="Ex: João da Silva"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                WhatsApp
              </label>
              <Input
                placeholder="+55 (00) 00000-0000"
                value={manualPhone}
                onChange={(e) => setManualPhone(maskPhone(e.target.value))}
                className="h-9 text-xs"
              />
            </div>
          </div>
        )}

        {/* Status de seleção */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span>
            {selectedIds.size} contato(s) selecionado(s)
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="hover:underline font-medium text-neutral-800"
            >
              Selecionar visíveis
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="hover:underline text-neutral-500"
              >
                Limpar seleção
              </button>
            )}
          </div>
        </div>

        {/* Lista visual de contatos */}
        <div className="max-h-[340px] overflow-y-auto flex flex-col border border-neutral-200/70 rounded-xl divide-y divide-neutral-100 bg-white">
          {filteredContacts.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted">
              Nenhum contato encontrado com o termo "{searchTerm}".
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const phoneDigits = contact.phone.replace(/\D/g, "");
              const isAlreadyAdded = existingPhones.has(phoneDigits);
              const isSelected = selectedIds.has(contact.id);

              return (
                <div
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id, isAlreadyAdded)}
                  className={`flex items-center gap-3.5 p-3 transition-colors ${
                    isAlreadyAdded
                      ? "opacity-60 bg-neutral-50/50 cursor-not-allowed"
                      : isSelected
                      ? "bg-neutral-100/60 cursor-pointer"
                      : "hover:bg-neutral-50 cursor-pointer"
                  }`}
                >
                  {/* Checkbox circular customizado Apple */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isAlreadyAdded
                        ? "border-neutral-300 bg-neutral-200 text-neutral-400"
                        : isSelected
                        ? "bg-black border-black text-white"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {(isSelected || isAlreadyAdded) && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Avatar com iniciais */}
                  <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Detalhes do contato */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <b className="text-sm font-semibold text-neutral-900 truncate">
                        {contact.name}
                      </b>
                      {isAlreadyAdded && (
                        <Badge variant="neutral" className="text-[10px] py-0.5 px-2">
                          Já adicionado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                      <span>{contact.phone}</span>
                      <span>•</span>
                      <span>{contact.recentActivity}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 && (!manualName.trim() || !manualPhone.trim())}
          >
            Adicionar {selectedIds.size > 0 ? `(${selectedIds.size})` : ""} à Lista
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

