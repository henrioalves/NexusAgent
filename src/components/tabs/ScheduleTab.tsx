import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Copy, AlertCircle, Info, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAgentConfig } from "../../context/AgentConfigContext";
import { Card, Field, SettingRow } from "../ui/LayoutCards";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Input";
import { Switch, Checkbox, SegmentedControl } from "../ui/Controls";
import { parseSafeDate, validateScheduleTimes } from "../../utils/masks";
import { generateUUID } from "../../utils/uuid";
import type { DaySchedule, Holiday } from "../../types/agent";

export const ScheduleTab: React.FC = () => {
  const { config, patchConfig, discardNonce, requestConfirm } = useAgentConfig();

  // Estados locais para adição de feriados
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayReason, setNewHolidayReason] = useState("");

  // Estado para feriado em edição
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [editHolidayDate, setEditHolidayDate] = useState("");
  const [editHolidayReason, setEditHolidayReason] = useState("");

  // Limpa estados temporários ao descartar
  useEffect(() => {
    setNewHolidayDate("");
    setNewHolidayReason("");
    setEditingHolidayId(null);
  }, [discardNonce]);

  const updateDay = (index: number, changes: Partial<DaySchedule>) => {
    const currentDay = config.days[index];
    const updatedDay = { ...currentDay, ...changes };

    // Se estiver aberto, valida horários
    if (updatedDay.open) {
      const validation = validateScheduleTimes(
        updatedDay.start,
        updatedDay.end,
        updatedDay.lunch,
        updatedDay.lunchStart,
        updatedDay.lunchEnd
      );

      if (!validation.valid && validation.error) {
        toast.warning(`Atenção em ${updatedDay.name}`, {
          description: validation.error,
        });
      }
    }

    patchConfig({
      days: config.days.map((d, i) => (i === index ? updatedDay : d)),
    });
  };

  const handleReplicateMonday = () => {
    const monday = config.days[0];
    patchConfig({
      days: config.days.map((d, i) =>
        i > 0 && i < 5
          ? {
              ...d,
              open: monday.open,
              start: monday.start,
              end: monday.end,
              lunch: monday.lunch,
              lunchStart: monday.lunchStart,
              lunchEnd: monday.lunchEnd,
            }
          : d
      ),
    });
    toast.success("Horários de Segunda replicados de Terça a Sexta!");
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate) {
      toast.error("Selecione uma data para o feriado ou bloqueio.");
      return;
    }
    if (!newHolidayReason.trim()) {
      toast.error("Informe o motivo ou descrição da data bloqueada.");
      return;
    }

    // Verifica duplicação
    const exists = config.holidays.some((h) => h.date === newHolidayDate);
    if (exists) {
      toast.error("Já existe um bloqueio cadastrado para esta data.");
      return;
    }

    const newH: Holiday = {
      id: generateUUID(),
      date: newHolidayDate,
      reason: newHolidayReason.trim(),
    };

    patchConfig({
      holidays: [...config.holidays, newH],
    });

    setNewHolidayDate("");
    setNewHolidayReason("");
    toast.success(`Data bloqueada: ${newH.reason}`);
  };

  const handleStartEditHoliday = (h: Holiday) => {
    setEditingHolidayId(h.id);
    setEditHolidayDate(h.date);
    setEditHolidayReason(h.reason);
  };

  const handleSaveEditHoliday = (id: string) => {
    if (!editHolidayDate || !editHolidayReason.trim()) {
      toast.error("Preencha data e motivo do bloqueio.");
      return;
    }

    patchConfig({
      holidays: config.holidays.map((item) =>
        item.id === id ? { ...item, date: editHolidayDate, reason: editHolidayReason.trim() } : item
      ),
    });

    setEditingHolidayId(null);
    toast.success("Data bloqueada atualizada com sucesso!");
  };

  const handleDeleteHoliday = (h: Holiday) => {
    requestConfirm({
      title: "Excluir data bloqueada?",
      message: `Tem certeza que deseja remover o recesso "${h.reason}"?`,
      confirmLabel: "Excluir",
      isDestructive: true,
      onConfirm: () => {
        patchConfig({
          holidays: config.holidays.filter((item) => item.id !== h.id),
        });
        toast.info("Data bloqueada removida.");
      },
    });
  };

  return (
    <div className="stack">
      {/* CARD 1: FUSO HORÁRIO */}
      <Card
        title="Fuso horário"
        subtitle={
          config.profile === "pessoal"
            ? "Usado na sincronização de lembretes e compromissos pessoais."
            : "Base de cálculo para o horário de funcionamento, atendimento e agendamentos."
        }
      >
        <Field label="Fuso horário principal">
          <Select
            value={config.timezone}
            onChange={(e) => patchConfig({ timezone: e.target.value })}
          >
            <option value="America/Sao_Paulo (GMT-03:00)">Brasília, São Paulo, Rio (GMT-03:00)</option>
            <option value="America/Manaus (GMT-04:00)">Manaus, Cuiabá, Campo Grande (GMT-04:00)</option>
            <option value="America/Rio_Branco (GMT-05:00)">Acre, Rio Branco (GMT-05:00)</option>
            <option value="America/Noronha (GMT-02:00)">Fernando de Noronha (GMT-02:00)</option>
            <option value="Europe/Lisbon (GMT+00:00)">Lisboa, Portugal (GMT+00:00)</option>
            <option value="America/New_York (GMT-05:00)">Nova York, EUA (GMT-05:00)</option>
          </Select>
        </Field>
      </Card>

      {/* CARD 2: GRADE SEMANAL */}
      <Card
        title={
          config.profile === "pessoal"
            ? "Grade semanal de disponibilidade pessoal"
            : "Grade semanal de funcionamento"
        }
        subtitle="Defina os horários em que o agente considera você ou sua equipe em expediente."
        action={
          <Button
            variant="secondary"
            icon={Copy}
            onClick={handleReplicateMonday}
            className="text-xs"
          >
            Replicar segunda até sexta
          </Button>
        }
      >
        <div className="schedule-list">
          {config.days.map((day, i) => (
            <div className={`day-row ${!day.open ? "closed" : ""}`} key={day.name}>
              {/* Nome do Dia e Toggle de Aberto/Fechado */}
              <div className="day-name">
                <Switch
                  checked={day.open}
                  onChange={(open) => updateDay(i, { open })}
                  ariaLabel={`Ativar atendimento na ${day.name}`}
                />
                <b>{day.name}</b>
              </div>

              {day.open ? (
                <>
                  {/* Horário de Início e Fim */}
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateDay(i, { start: e.target.value })}
                      aria-label={`Início de expediente na ${day.name}`}
                    />
                    <span className="text-muted text-xs">até</span>
                    <Input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateDay(i, { end: e.target.value })}
                      aria-label={`Término de expediente na ${day.name}`}
                    />
                  </div>

                  {/* Toggle de Almoço */}
                  <label className="lunch">
                    <Switch
                      checked={day.lunch}
                      onChange={(lunch) => updateDay(i, { lunch })}
                      ariaLabel={`Pausa de almoço na ${day.name}`}
                    />
                    <span>Pausa</span>
                  </label>

                  {/* Horários do Almoço */}
                  {day.lunch ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="time"
                        value={day.lunchStart}
                        onChange={(e) => updateDay(i, { lunchStart: e.target.value })}
                        aria-label={`Início do almoço na ${day.name}`}
                      />
                      <span className="text-muted text-xs">até</span>
                      <Input
                        type="time"
                        value={day.lunchEnd}
                        onChange={(e) => updateDay(i, { lunchEnd: e.target.value })}
                        aria-label={`Término do almoço na ${day.name}`}
                      />
                    </div>
                  ) : (
                    <span className="text-muted text-xs">Sem intervalo</span>
                  )}
                </>
              ) : (
                <span className="closed-label">Sem atendimento (Fechado)</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* CARD 3: FERIADOS & COMPORTAMENTO FORA DE HORA */}
      <div className="two-col">
        {/* FERIADOS E RECESSO */}
        <Card
          title="Feriados e datas bloqueadas"
          subtitle="Crie exceções pontuais no calendário para períodos sem atendimento."
        >
          <SettingRow
            title="Aplicar feriados nacionais automaticamente"
            description="Considera feriados oficiais brasileiros como dias de recesso."
            control={
              <Switch
                checked={config.autoHolidays}
                onChange={(v) => patchConfig({ autoHolidays: v })}
                ariaLabel="Aplicar feriados nacionais"
              />
            }
          />

          <div className="inline-form compact-form mt-3">
            <Input
              type="date"
              value={newHolidayDate}
              onChange={(e) => setNewHolidayDate(e.target.value)}
            />
            <Input
              placeholder="Motivo (ex: Recesso de Carnaval)"
              value={newHolidayReason}
              onChange={(e) => setNewHolidayReason(e.target.value)}
            />
            <Button variant="primary" icon={Plus} onClick={handleAddHoliday}>
              Adicionar
            </Button>
          </div>

          <div className="flex flex-col mt-2">
            {config.holidays.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted">
                Nenhum feriado ou data bloqueada cadastrada.
              </div>
            ) : (
              config.holidays.map((h) => {
                const dateParts = parseSafeDate(h.date);
                const isEditing = editingHolidayId === h.id;

                if (isEditing) {
                  return (
                    <div className="mini-row" key={h.id}>
                      <Input
                        type="date"
                        value={editHolidayDate}
                        onChange={(e) => setEditHolidayDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        value={editHolidayReason}
                        onChange={(e) => setEditHolidayReason(e.target.value)}
                        placeholder="Motivo"
                        className="h-8 text-xs"
                      />
                      <Button
                        variant="primary"
                        icon={Check}
                        onClick={() => handleSaveEditHoliday(h.id)}
                        className="h-8 px-2"
                      />
                      <Button
                        variant="ghost"
                        icon={X}
                        onClick={() => setEditingHolidayId(null)}
                        className="h-8 px-2"
                      />
                    </div>
                  );
                }

                return (
                  <div className="mini-row" key={h.id}>
                    <div className="date-badge">
                      <b>{dateParts.day}</b>
                      <span>
                        {dateParts.month}/{dateParts.year.slice(-2)}
                      </span>
                    </div>
                    <div className="grow">
                      <b>{h.reason}</b>
                      <span>Dia inteiro bloqueado</span>
                    </div>
                    <Button
                      variant="ghost"
                      icon={Edit2}
                      onClick={() => handleStartEditHoliday(h)}
                      className="px-2"
                      title="Editar data"
                    />
                    <Button
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handleDeleteHoliday(h)}
                      className="px-2 text-red-500 hover:text-red-700"
                      title="Excluir data"
                    />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* COMPORTAMENTO FORA DE HORA */}
        <Card
          title="Comportamento fora de hora"
          subtitle="Escolha exatamente como a IA deve responder dependendo do momento."
        >
          <Field
            label="Durante a pausa de almoço"
            hint="Como o robô procede caso alguém mande mensagem no intervalo da equipe."
          >
            <Select
              value={config.lunchBehavior}
              onChange={(e) => patchConfig({ lunchBehavior: e.target.value })}
            >
              <option value="Atender normal sem avisar">Atender normal sem avisar</option>
              <option value="Atender e avisar quando a equipe retorna">
                Atender e avisar quando a equipe retorna
              </option>
              <option value="Enviar apenas mensagem fixa de almoço">
                Enviar apenas mensagem fixa de almoço
              </option>
            </Select>
          </Field>

          <Field
            label="Fora do expediente comercial e feriados"
            hint="Estratégia do agente nas madrugadas, fins de semana e recesso."
          >
            <Select
              value={config.afterHours}
              onChange={(e) => patchConfig({ afterHours: e.target.value })}
            >
              <option value="Atendimento IA 24/7 normal">Atendimento IA 24/7 normal (Recomendado)</option>
              <option value="Atender e agendar, mas avisar que está fechado">
                Atender e agendar, mas avisar que está fechado
              </option>
              <option value="Enviar mensagem única de ausência">
                Enviar mensagem única de ausência
              </option>
              <option value="Ficar totalmente mudo">Ficar totalmente mudo</option>
            </Select>
          </Field>

          {config.afterHours === "Enviar mensagem única de ausência" && (
            <Field label="Mensagem de ausência personalizada">
              <Textarea
                value={config.awayMessage}
                onChange={(e) => patchConfig({ awayMessage: e.target.value })}
                rows={3}
              />
            </Field>
          )}
        </Card>
      </div>

      {/* CARD 4: REGRAS DE AGENDAMENTO */}
      <Card
        title="Regras de agendamento"
        subtitle="Parâmetros finos utilizados pelo agente para calcular disponibilidade e reservar horários."
      >
        {!config.calendar && (
          <div className="warning">
            <Calendar size={18} />
            <div>
              <b>Google Agenda ainda não conectado</b>
              <span>
                Você pode parametrizar todas as regras agora e vincular a conta Google depois na aba Conexões.
              </span>
            </div>
          </div>
        )}

        <div className="form-grid">
          <Field label="Duração padrão de cada atendimento">
            <SegmentedControl
              options={["30 min", "45 min", "1 hora", "Por serviço"]}
              value={config.duration}
              onChange={(v) => patchConfig({ duration: v })}
            />
          </Field>

          <Field label="Intervalo entre reuniões (buffer)">
            <Select
              value={config.buffer}
              onChange={(e) => patchConfig({ buffer: e.target.value })}
            >
              <option value="Nenhum">Nenhum</option>
              <option value="10 min">10 min</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
            </Select>
          </Field>

          <Field label="Antecedência mínima para agendar">
            <Input
              type="number"
              min={0}
              value={config.minNotice}
              suffix="horas"
              onChange={(e) =>
                patchConfig({ minNotice: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </Field>

          <Field label="Janela máxima futura">
            <Input
              type="number"
              min={1}
              value={config.maxFuture}
              suffix="dias"
              onChange={(e) =>
                patchConfig({ maxFuture: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          </Field>
        </div>

        <div className="checks horizontal mt-4">
          <span className="text-xs font-semibold text-gray-700 mr-2 flex items-center">
            Dados obrigatórios antes de confirmar reserva:
          </span>
          {["Nome completo", "CPF", "E-mail", "Serviço / motivo"].map((field) => (
            <Checkbox
              key={field}
              label={field}
              checked={config.bookingFields.includes(field)}
              onChange={(checked) => {
                const next = checked
                  ? [...config.bookingFields, field]
                  : config.bookingFields.filter((f) => f !== field);
                patchConfig({ bookingFields: next });
              }}
            />
          ))}
        </div>

        <SettingRow
          title="Permitir cancelamentos e reagendamentos pelo WhatsApp"
          description="O agente poderá consultar compromissos existentes e sugerir novos horários mediante validação do nome ou documento."
          control={
            <Switch
              checked={config.reschedule}
              onChange={(v) => patchConfig({ reschedule: v })}
              ariaLabel="Permitir cancelamentos e reagendamentos"
            />
          }
          className="mt-4"
        />
      </Card>
    </div>
  );
};

