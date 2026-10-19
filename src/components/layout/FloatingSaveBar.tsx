import React, { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Button } from "../ui/Button";

export const FloatingSaveBar: React.FC = () => {
  const { isDirty, saveConfig, discardChanges } = useAgentConfig();
  const [isSaving, setIsSaving] = useState(false);

  if (!isDirty) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveConfig();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="savebar animate-fade" role="region" aria-label="Alterações não salvas">
      <div className="flex items-center gap-3">
        <span className="pulse" />
        <div>
          <b>Você tem alterações não salvas</b>
          <small>Atualize o agente para aplicar as novas regras e sincronizar o fluxo.</small>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          icon={RotateCcw}
          onClick={discardChanges}
          disabled={isSaving}
          className="text-xs text-gray-300 hover:text-white"
        >
          Descartar
        </Button>
        <Button
          variant="primary"
          icon={Check}
          onClick={handleSave}
          loading={isSaving}
          className="text-xs bg-white text-black hover:bg-gray-100 font-semibold"
        >
          Salvar e atualizar agente
        </Button>
      </div>
    </aside>
  );
};

