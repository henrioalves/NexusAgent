import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X, RotateCcw, AlertTriangle, Power, Bot } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAgentConfig } from "../../context/AgentConfigContext";

interface ChatMessage {
  from: "user" | "agent";
  text: string;
  time: string;
}

export const ChatDrawer: React.FC = () => {
  const { config, patchConfig, isDrawerOpen, setIsDrawerOpen } = useAgentConfig();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      from: "agent",
      text: `Olá! Sou ${config.agentName}. Como posso te ajudar hoje?`,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Escuta tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Rola mensagens para o fim
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isDrawerOpen) return null;

  // Gerador inteligente de respostas de simulação
  const generateSimulatedReply = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    const tone = config.tone.toLowerCase();
    const emojiMap: Record<string, string> = {
      Nenhum: "",
      Moderado: " ✨",
      Frequente: " 😊✨👍",
    };
    const emoji = emojiMap[config.emojis] || "";

    // 1. Checagem de Guardrail (Descontos)
    if (query.includes("desconto") || query.includes("mais barato") || query.includes("promoção")) {
      return `Com relação a valores, trabalhamos estritamente com a tabela oficial de serviços para garantir a máxima qualidade no atendimento. Não temos autorização para conceder descontos não cadastrados.${emoji}`;
    }

    // 2. Checagem de FAQ
    for (const item of config.faq) {
      const qWords = item.question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matches = qWords.some((word) => query.includes(word));
      if (matches) {
        return `${item.answer}${emoji}`;
      }
    }

    // 3. Checagem de Catálogo (Preços e Serviços)
    if (
      query.includes("preço") ||
      query.includes("valor") ||
      query.includes("quanto custa") ||
      query.includes("serviço") ||
      query.includes("procedimento") ||
      query.includes("consulta")
    ) {
      if (config.catalog.length > 0) {
        const catalogList = config.catalog
          .map((c) => `• ${c.name}: ${c.price} (${c.duration} min)`)
          .join("\n");
        return `Aqui estão as opções disponíveis no nosso catálogo:\n\n${catalogList}\n\nGostaria de agendar algum desses horários?${emoji}`;
      }
    }

    // 4. Checagem de Horários de Funcionamento
    if (
      query.includes("horário") ||
      query.includes("que horas") ||
      query.includes("aberto") ||
      query.includes("atende hoje")
    ) {
      const openDays = config.days.filter((d) => d.open).map((d) => `${d.name} (${d.start} às ${d.end})`).join(", ");
      return `Nosso horário padrão de atendimento é: ${openDays}. Como posso te ajudar a reservar o melhor período?${emoji}`;
    }

    // 5. Checagem de Localização / Endereço
    if (query.includes("onde") || query.includes("endereço") || query.includes("local")) {
      const activeData =
        config.profile === "empresa"
          ? config.profileData.company
          : config.profile === "profissional"
          ? config.profileData.professional
          : config.profileData.personal;

      if ("address" in activeData && activeData.address) {
        return `Estamos localizados em: ${activeData.address}.${emoji}`;
      }
    }

    // 6. Resposta padrão orientada ao objetivo
    if (config.goal === "Agendamento") {
      return `Com certeza! Para realizarmos o seu agendamento, qual dia da semana e período (manhã ou tarde) fica mais confortável para você?${emoji}`;
    }

    return `Entendi perfeitamente sua mensagem sobre "${userQuery.slice(0, 35)}...". Estou à disposição para tirar qualquer dúvida e te orientar.${emoji}`;
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    if (!config.active) return;

    const userText = inputMessage.trim();
    const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [...prev, { from: "user", text: userText, time: nowTime }]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateSimulatedReply(userText);
      const replyTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [...prev, { from: "agent", text: replyText, time: replyTime }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div
      className="drawer-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsDrawerOpen(false);
      }}
    >
      <aside className="drawer" role="dialog" aria-label="Playground de teste do agente">
        {/* CABEÇALHO DO PLAYGROUND */}
        <div className="drawer-head">
          <div className="avatar agent">
            <Sparkles size={18} />
          </div>
          <div className="grow">
            <b>{config.agentName}</b>
            <span>
              <i className={`dot ${config.active ? "online" : ""}`} />
              {config.active ? "Agente ativo e respondendo" : "Agente pausado"}
            </span>
          </div>

          <Button
            variant="ghost"
            icon={RotateCcw}
            onClick={() =>
              setMessages([
                {
                  from: "agent",
                  text: `Olá! Sou ${config.agentName}. Como posso te ajudar hoje?`,
                  time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="text-xs px-2"
            title="Limpar conversa"
          >
            Limpar
          </Button>

          <Button
            variant="ghost"
            icon={X}
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Fechar playground"
          />
        </div>

        {/* BANNER SE AGENTE ESTIVER PAUSADO */}
        {!config.active && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 flex-none" />
              <span>
                <b>Agente pausado:</b> O robô não responderá automaticamente no WhatsApp.
              </span>
            </div>
            <Button
              variant="primary"
              icon={Power}
              onClick={() => patchConfig({ active: true })}
              className="h-7 text-xs px-2 bg-amber-700 hover:bg-amber-800"
            >
              Ativar agora
            </Button>
          </div>
        )}

        <div className="chat-context">
          <Bot size={13} />
          <span>Ambiente de teste · Consulta FAQ, Catálogo e Guardrails cadastrados</span>
        </div>

        {/* LISTA DE MENSAGENS */}
        <div className="messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.from}`}>
              <span className="whitespace-pre-line">{m.text}</span>
              <small>{m.time}</small>
            </div>
          ))}

          {isTyping && (
            <div className="message agent flex items-center gap-1.5 py-2 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-200" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER DE MENSAGENS */}
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            autoFocus
            disabled={!config.active}
            placeholder={
              config.active
                ? `Digite uma dúvida para testar ${config.agentName}...`
                : "Ative o agente para enviar mensagens de teste..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={!inputMessage.trim() || !config.active}
          />
        </form>
      </aside>
    </div>
  );
};

