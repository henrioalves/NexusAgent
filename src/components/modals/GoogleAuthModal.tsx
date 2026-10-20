import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import { ModalWrapper } from "../ui/ModalWrapper";
import { Button } from "../ui/Button";
import { useAgentConfig } from "../../context/AgentConfigContext";

const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_OAUTH_URL || "URL_DO_SEU_BACKEND_OAUTH";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { connectCalendar } = useAgentConfig();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsRedirecting(true);
    try {
      if (GOOGLE_OAUTH_URL && GOOGLE_OAUTH_URL !== "URL_DO_SEU_BACKEND_OAUTH") {
        sessionStorage.setItem("oauth_calendar_pending", "true");
        window.location.href = GOOGLE_OAUTH_URL;
      } else {
        // Fallback para desenvolvimento e testes locais
        await new Promise((resolve) => setTimeout(resolve, 800));
        await connectCalendar("Agenda principal");
        toast.info("Modo de desenvolvimento", {
          description:
            "Simulação de conexão realizada com sucesso. Para autenticação real via Google, configure a variável VITE_GOOGLE_OAUTH_URL no arquivo .env.",
        });
        onClose();
      }
    } catch (error) {
      console.error("Erro no redirecionamento OAuth do Google:", error);
      toast.error("Não foi possível iniciar o login com o Google", {
        description: "Verifique sua conexão ou tente novamente mais tarde.",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Google Agenda · Autorização OAuth2"
      title="Conectar Google Agenda"
    >
      <div className="connect-modal">
        <div className="oauth-icon">
          <Calendar size={32} className="text-gray-800" />
        </div>

        <h3>Autorizar acesso à sua agenda</h3>
        <p>
          Conecte sua agenda para permitir agendamentos automáticos, consulta de horários disponíveis e sincronização em tempo real.
        </p>

        <div className="permission-list">
          <span>
            <Check size={14} className="text-green-600 shrink-0" />
            Visualizar eventos e consultar disponibilidade de horários
          </span>
          <span>
            <Check size={14} className="text-green-600 shrink-0" />
            Criar e atualizar compromissos confirmados pelo cliente
          </span>
          <span>
            <Check size={14} className="text-green-600 shrink-0" />
            Remover compromissos cancelados e liberar horários
          </span>
        </div>

        <Button
          variant="primary"
          onClick={handleGoogleLogin}
          loading={isRedirecting}
          icon={isRedirecting ? undefined : Calendar}
          className="w-full max-w-xs"
        >
          {isRedirecting ? "Redirecionando..." : "Entrar com o Google"}
        </Button>
      </div>
    </ModalWrapper>
  );
};
