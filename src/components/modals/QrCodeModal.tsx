import React from "react";
import { QrCode, Sparkles, Loader2 } from "lucide-react";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { useAgentConfig } from "../../context/AgentConfigContext";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connectWhatsApp } = useAgentConfig();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Evolution API · Conectar Canal"
      title="Conectar WhatsApp via QR Code"
    >
      <div className="connect-modal">
        {/* Placeholder elegante aguardando geração do QR Code real */}
        <div className="w-56 h-56 rounded-2xl bg-neutral-50/80 border border-neutral-200/90 flex flex-col items-center justify-center p-5 text-center gap-2.5 relative shadow-inner mb-4">
          <div className="w-10 h-10 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin flex items-center justify-center" />
          <div className="flex flex-col gap-1 items-center">
            <b className="text-xs font-semibold text-neutral-800">
              Aguardando geração do QR Code real...
            </b>
            <span className="text-[11px] text-neutral-400 leading-snug max-w-[180px]">
              Estabelecendo conexão segura com a instância Evolution API
            </span>
          </div>
        </div>

        <h3>Leia o QR Code pelo WhatsApp</h3>
        <p>
          Abra o WhatsApp no celular, toque em <b>Configurações &gt; Aparelhos conectados &gt; Conectar aparelho</b> e aponte a câmera para a tela assim que o QR Code for gerado.
        </p>

        <div className="waiting">
          <span className="spinner" />
          <span>Sincronizando com a API em tempo real...</span>
        </div>

        <Button
          variant="secondary"
          onClick={connectWhatsApp}
          className="w-full max-w-xs text-xs"
        >
          Simular conexão concluída
        </Button>
      </div>
    </ModalWrapper>
  );
};
