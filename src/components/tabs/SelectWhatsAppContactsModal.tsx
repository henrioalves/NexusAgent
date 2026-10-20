import React, { useState, useMemo } from "react";
import { Search, Check, Plus, Users } from "lucide-react";
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

export interface WhatsAppContactItem {
  id: string;
  name: string;
  phone: string;
  recentActivity?: string;
}

export const SelectWhatsAppContactsModal: React.FC<SelectWhatsAppContactsModalProps> = ({
  isOpen,
  onClose,
  contactMode,
  existingExceptions,
  onAddContacts,
}) => {
  // Lista inicial de contatos 100% limpa (pronta para receber dados reais da Evolution API)
  const contacts: WhatsAppContactItem[] = [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showManualForm, setShowManualForm] = useState(true);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Conjunto de telefones já presentes na lista para evitar duplicidade
  const existingPhones = useMemo(() => {
    return new Set(
      existingExceptions.map((ex) => ex.phone.replace(/\D/g, ""))
    );
  }, [existingExceptions]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    const digits = term.replace(/\D/g, "");
    return contacts.filter((c) => {
      const matchName = c.name.toLowerCase().includes(term);
      const matchPhone = digits ? c.phone.replace(/\D/g, "").includes(digits) : false;
      return matchName || matchPhone;
    });
  }, [contacts, searchTerm]);

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

    // Contatos selecionados da lista sincronizada
    contacts.forEach((c) => {
      if (selectedIds.has(c.id)) {
        contactsToAdd.push({
          id: generateUUID(),
          name: c.name,
          phone: c.phone,
        });
      }
    });

    // Contato manual se preenchido
    if (manualName.trim() && manualPhone.trim()) {
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
        {/* Formulário manual para adicionar número diretamente */}
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
                autoFocus
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                WhatsApp com DDD
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

        {/* Barra de busca e status */}
        {contacts.length > 0 && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar por nome ou telefone no WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-sm"
                />
                <Search size={15} className="absolute left-3 top-3 text-muted pointer-events-none" />
              </div>
              <Button
                variant={showManualForm ? "secondary" : "ghost"}
                icon={Plus}
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs"
              >
                {showManualForm ? "Ocultar manual" : "Digitar número"}
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted px-1">
              <span>{selectedIds.size} contato(s) selecionado(s)</span>
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
          </>
        )}

        {/* Lista visual de contatos ou Empty State */}
        <div className="max-h-[340px] overflow-y-auto flex flex-col border border-neutral-200/70 rounded-xl divide-y divide-neutral-100 bg-white">
          {filteredContacts.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2 text-muted">
              <Users size={28} className="text-neutral-300 mb-1" />
              <b className="text-xs font-semibold text-neutral-700">Nenhum contato sincronizado do WhatsApp</b>
              <p className="text-[11px] text-neutral-400 max-w-sm m-0">
                Conecte seu WhatsApp na aba Conexões para sincronizar conversas, ou use os campos manuais acima para cadastrar números.
              </p>
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

                  <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>

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
                      {contact.recentActivity && (
                        <>
                          <span>•</span>
                          <span>{contact.recentActivity}</span>
                        </>
                      )}
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
