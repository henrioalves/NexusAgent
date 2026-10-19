import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { useAgentConfig } from "../../context/AgentConfigContext";

interface PayloadJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PayloadJsonModal: React.FC<PayloadJsonModalProps> = ({ isOpen, onClose }) => {
  const { config } = useAgentConfig();
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(config, null, 2);

  const handleCopy = () => {
    navigator.clipboard?.writeText(jsonString);
    setCopied(true);
    toast.success("Payload JSON copiado!", {
      description: "Pronto para colar no nó Webhook do n8n ou no seu back-end.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Modo Desenvolvedor · n8n Ready"
      title="Payload JSON da Configuração"
      maxWidth="wide"
    >
      <div>
        <div className="json-toolbar">
          <p className="flex items-center gap-1.5">
            <Terminal size={14} className="text-muted" />
            Estrutura unificada e validada para consumo direto pelo workflow do n8n.
          </p>
          <Button
            variant="secondary"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? "Copiado com sucesso!" : "Copiar JSON"}
          </Button>
        </div>

        <pre className="json-view select-all">
          <code>{jsonString}</code>
        </pre>
      </div>
    </ModalWrapper>
  );
};

