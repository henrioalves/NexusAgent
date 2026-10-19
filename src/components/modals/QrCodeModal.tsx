import React, { useState } from "react";
import { QrCode, KeyRound, Copy, Check, Sparkles, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { maskPhone } from "../../utils/masks";
import { useAgentConfig } from "../../context/AgentConfigContext";

interface QrCodeModalProps {
  initialMode?: "qr" | "pairing";
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  initialMode = "qr",
  isOpen,
  onClose,
}) => {
  const { connectWhatsApp } = useAgentConfig();
  const [mode, setMode] = useState<"qr" | "pairing">(initialMode);
  const [phone, setPhone] = useState("+55 11 99999-9999");
  const [pairingCode] = useState("NX84-92KL");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopied(true);
    toast.success("Código de pareamento copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Evolution API · Conectar Canal"
      title="Conectar WhatsApp"
    >
      <div className="connect-modal">
        {/* SELETOR DE MODO: QR CODE VS CÓDIGO DE PAREAMENTO */}
        <div className="segmented mb-5 max-w-xs">
          <button
            type="button"
            className={mode === "qr" ? "selected" : ""}
            onClick={() => setMode("qr")}
          >
            <span className="flex items-center justify-center gap-1.5">
              <QrCode size={14} />
              QR Code
            </span>
          </button>
          <button
            type="button"
            className={mode === "pairing" ? "selected" : ""}
            onClick={() => setMode("pairing")}
          >
            <span className="flex items-center justify-center gap-1.5">
              <KeyRound size={14} />
              Código de Pareamento
            </span>
          </button>
        </div>

        {mode === "qr" ? (
          <>
            <div className="qr">
              <div className="qr-pattern" />
              <span className="brand-mark">
                <Sparkles size={16} />
              </span>
            </div>

            <h3>Leia o QR Code pelo WhatsApp</h3>
            <p>
              Abra o WhatsApp no celular, toque em <b>Configurações &gt; Aparelhos conectados &gt; Conectar aparelho</b> e aponte a câmera.
            </p>

            <div className="waiting">
              <span className="spinner" />
              <span>Aguardando leitura do código...</span>
            </div>

            <Button variant="primary" onClick={connectWhatsApp} className="w-full max-w-xs">
              Simular leitura com sucesso
            </Button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gray-100 grid place-items-center mb-3 text-black">
              <Smartphone size={28} />
            </div>

            <h3>Conectar com Código de Pareamento</h3>
            <p>
              Ideal se você estiver operando no próprio celular ou sem câmera disponível no momento.
            </p>

            <div className="w-full max-w-xs mb-4 text-left">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Número do WhatsApp com DDD:
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="+55 (11) 99999-9999"
              />
            </div>

            {/* CÓDIGO GERADO DE 8 CARACTERES */}
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 w-full max-w-xs mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">
                  Código de 8 dígitos
                </span>
                <b className="text-2xl font-mono tracking-widest text-black">{pairingCode}</b>
              </div>
              <Button
                variant="secondary"
                icon={copied ? Check : Copy}
                onClick={handleCopyCode}
                className="h-9 px-3 text-xs"
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>

            <ol className="text-xs text-muted text-left max-w-xs space-y-1.5 mb-5 list-decimal pl-4">
              <li>No celular, abra <b>Aparelhos conectados</b>.</li>
              <li>Toque em <b>Conectar com número de telefone</b>.</li>
              <li>Digite o código <b>{pairingCode}</b> gerado acima.</li>
            </ol>

            <Button variant="primary" onClick={connectWhatsApp} className="w-full max-w-xs">
              Simular confirmação no celular
            </Button>
          </>
        )}
      </div>
    </ModalWrapper>
  );
};

