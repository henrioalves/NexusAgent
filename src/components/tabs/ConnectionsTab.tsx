import React from "react";
import { Phone, Calendar, Check, QrCode, KeyRound } from "lucide-react";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, Badge } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Select } from "../ui/Input";

export const ConnectionsTab: React.FC = () => {
  const {
    config,
    patchConfig,
    setActiveModal,
    disconnectWhatsApp,
    disconnectCalendar,
  } = useAgentConfig();

  return (
    <div className="two-col">
      {/* CARD WHATSAPP (EVOLUTION API) */}
      <Card
        className="integration-card"
        title="WhatsApp"
        subtitle="Evolution API · Canal principal de atendimento"
        action={
          <div className="integration-icon">
            <Phone size={20} />
          </div>
        }
      >
        {config.whatsapp ? (
          <div className="connected-profile">
            <div className="avatar">NA</div>
            <div className="grow">
              <b>Atendimento NexusAgent</b>
              <span>{config.whatsappPhone || "+55 11 99999-9999"}</span>
              <small>Instância: {config.whatsappInstance || "nexusagent-main"}</small>
            </div>
            <Badge variant="success" dot>
              Online
            </Badge>
          </div>
        ) : (
          <div className="empty-integration">
            <p>
              Conecte seu número para receber mensagens e permitir que o agente responda em tempo
              real aos seus clientes.
            </p>
            <div className="notice">
              <span>Canal necessário para publicar o agente</span>
            </div>
          </div>
        )}

        <div className="card-actions">
          {config.whatsapp ? (
            <Button variant="danger" onClick={disconnectWhatsApp}>
              Desconectar WhatsApp
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                icon={QrCode}
                onClick={() => setActiveModal("qr")}
              >
                Gerar QR Code
              </Button>
              <Button
                variant="secondary"
                icon={KeyRound}
                onClick={() => setActiveModal("pairing")}
              >
                Usar código de pareamento
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* CARD GOOGLE CALENDAR */}
      <Card
        className="integration-card"
        title="Google Agenda"
        subtitle="Google Calendar · Opcional para reservas"
        action={
          <div className="integration-icon">
            <Calendar size={20} />
          </div>
        }
      >
        {config.calendar ? (
          <>
            <div className="connected-profile">
              <div className="avatar subtle">GC</div>
              <div className="grow">
                <b>contato@nexusagent.ai</b>
                <span>Conta Google vinculada</span>
              </div>
              <Badge variant="success" dot>
                Sincronizado
              </Badge>
            </div>
            <Field label="Agenda ativa para agendamentos">
              <Select
                value={config.calendarName}
                onChange={(e) => patchConfig({ calendarName: e.target.value })}
              >
                <option value="Agenda principal">Agenda principal</option>
                <option value="Consultório">Consultório</option>
                <option value="Reuniões">Reuniões</option>
              </Select>
            </Field>
          </>
        ) : (
          <div className="empty-integration">
            <p>
              Consulte disponibilidade, crie eventos e permita cancelamentos ou reagendamentos sem
              intervenção manual da equipe.
            </p>
            <ul className="benefit-list">
              <li>
                <Check size={14} className="text-green-600" />
                <span>Consulta horários livres em tempo real</span>
              </li>
              <li>
                <Check size={14} className="text-green-600" />
                <span>Agenda e envia convites automáticos</span>
              </li>
              <li>
                <Check size={14} className="text-green-600" />
                <span>Bloqueia conflitos e horários ocupados</span>
              </li>
            </ul>
          </div>
        )}

        <div className="card-actions">
          {config.calendar ? (
            <Button variant="danger" onClick={disconnectCalendar}>
              Desvincular agenda
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Calendar}
              onClick={() => setActiveModal("calendar")}
            >
              Conectar Google Calendar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

