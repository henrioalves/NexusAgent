import React, { useState, useEffect } from "react";
import { Sparkles, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../services/supabase";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Checkbox } from "../ui/Controls";

const REMEMBER_EMAIL_KEY = "nexusagent_remember_email";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Por favor, digite seu e-mail corporativo.");
      return;
    }
    if (!password) {
      toast.error("Por favor, digite sua senha de acesso.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_credentials")
        ) {
          toast.error("Credenciais inválidas", {
            description: "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("E-mail não confirmado", {
            description: "Por favor, confirme seu endereço de e-mail antes de acessar a plataforma.",
          });
        } else if (error.message.includes("Too many requests")) {
          toast.error("Limite de tentativas excedido", {
            description: "Muitas tentativas consecutivas de login. Aguarde alguns instantes e tente novamente.",
          });
        } else {
          toast.error("Erro na autenticação", {
            description: error.message || "Não foi possível realizar o login. Tente novamente.",
          });
        }
        return;
      }

      if (data?.session) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }

        toast.success("Autenticado com sucesso!", {
          description: "Carregando o painel de gerenciamento do NexusAgent...",
        });
        onLoginSuccess?.();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocorreu uma falha inesperada.";
      toast.error("Erro de conexão com o servidor", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-center items-center p-4">
      {/* CARD CENTRAL DE LOGIN NO ESTILO APPLE MONOCHROME */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[rgba(0,0,0,0.08)] shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-8 animate-pop">
        {/* LOGO & CABEÇALHO */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black text-white grid place-items-center mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            <Sparkles size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-1.5">
            NexusAgent
          </h1>
          <p className="text-xs text-[#86868b] max-w-[260px] leading-relaxed">
            Painel exclusivo para configuração, personalização e monitoramento do seu agente de IA.
          </p>
        </div>

        {/* FORMULÁRIO FECHADO: APENAS E-MAIL, SENHA E ENTRAR */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <Mail size={13} className="text-[#86868b]" />
              E-mail
            </label>
            <Input
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 text-sm bg-[#fafafa] border-[rgba(0,0,0,0.1)] focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <Lock size={13} className="text-[#86868b]" />
              Senha
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 text-sm bg-[#fafafa] border-[rgba(0,0,0,0.1)] focus:border-black"
            />
          </div>

          {/* CHECKBOX LEMBRE-SE DE MIM */}
          <div className="pt-0.5">
            <Checkbox
              label="Lembre-se de mim"
              checked={rememberMe}
              onChange={setRememberMe}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full h-11 mt-2 text-sm font-semibold bg-black text-white hover:bg-[#1d1d1f] shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center gap-2"
          >
            <span>Entrar</span>
            {!loading && <ArrowRight size={15} />}
          </Button>
        </form>

        {/* AVISO INSTITUCIONAL DE SISTEMA FECHADO */}
        <div className="mt-8 pt-6 border-t border-[rgba(0,0,0,0.06)] text-center">
          <p className="text-[11px] text-[#86868b] leading-relaxed">
            Acesso restrito a clientes cadastrados. Para assinar ou solicitar suporte, entre em contato com seu gestor.
          </p>
        </div>
      </div>
    </div>
  );
};

