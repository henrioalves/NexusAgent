import React from "react";
import { Calendar, Check } from "lucide-react";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { useAgentConfig } from "../../context/AgentConfigContext";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { connectCalendar } = useAgentConfig();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Google Workspace · OAuth2"
      title="Conectar Google Calendar"
    >
      <div className="connect-modal">
        <div className="oauth-icon">
          <Calendar size={32} className="text-gray-800" />
        </div>

        <h3>Autorizar acesso à sua agenda</h3>
        <p>
          O NexusMind poderá consultar horários livres, criar novos eventos autorizados e reagendar compromissos em tempo real.
        </p>

        <div className="permission-list">
          <span>
            <Check size={14} className="text-green-600" />
            Visualizar eventos e consultar disponibilidade
          </span>
          <span>
            <Check size={14} className="text-green-600" />
            Criar e editar compromissos confirmados pelo cliente
          </span>
          <span>
            <Check size={14} className="text-green-600" />
            Remover horários cancelados e liberar agenda
          </span>
        </div>

        <Button
          variant="primary"
          onClick={connectCalendar}
          className="w-full max-w-xs"
        >
          Continuar com a conta Google
        </Button>
      </div>
    </ModalWrapper>
  );
};

