import React from "react";
import { Toaster } from "sonner";
import { Sparkles } from "lucide-react";
import { AgentConfigProvider, useAgentConfig } from "./context/AgentConfigContext";
import { LoginScreen } from "./components/auth/LoginScreen";
import { Header } from "./components/layout/Header";
import { TabBar } from "./components/layout/TabBar";
import { PageTitle } from "./components/layout/PageTitle";
import { FloatingSaveBar } from "./components/layout/FloatingSaveBar";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";

// Abas Funcionais (Módulos)
import { ConnectionsTab } from "./components/tabs/ConnectionsTab";
import { AttendanceTab } from "./components/tabs/AttendanceTab";
import { ScheduleTab } from "./components/tabs/ScheduleTab";
import { IdentityTab } from "./components/tabs/IdentityTab";
import { KnowledgeBaseTab } from "./components/tabs/KnowledgeBaseTab";

// Modais e Gavetas
import { QrCodeModal } from "./components/modals/QrCodeModal";
import { GoogleAuthModal } from "./components/modals/GoogleAuthModal";
import { PayloadJsonModal } from "./components/modals/PayloadJsonModal";
import { OnboardingWizardModal } from "./components/modals/OnboardingWizardModal";
import { ChatDrawer } from "./components/modals/ChatDrawer";

function AppContent() {
  const {
    user,
    authLoading,
    configLoading,
    activeTab,
    activeModal,
    setActiveModal,
  } = useAgentConfig();

  // 1. Tela de Carregamento Inicial de Autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-center items-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-black text-white grid place-items-center mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.15)] animate-pulse">
          <Sparkles size={22} />
        </div>
        <p className="text-xs text-[#86868b] font-medium tracking-wide">
          Iniciando sessão segura NexusAgent...
        </p>
      </div>
    );
  }

  // 2. Barreira de Entrada: Se não autenticado, renderiza EXCLUSIVAMENTE a tela de Login
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <TabBar />
        <div className="page">
          <PageTitle />

          {configLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <span className="spinner w-6 h-6 border-2 border-gray-300 border-t-black rounded-full" />
              <p className="text-xs text-muted">Carregando configurações da nuvem Supabase...</p>
            </div>
          ) : (
            <>
              {activeTab === "connections" && <ConnectionsTab />}
              {activeTab === "contacts" && <AttendanceTab />}
              {activeTab === "schedule" && <ScheduleTab />}
              {activeTab === "identity" && <IdentityTab />}
              {activeTab === "knowledge" && <KnowledgeBaseTab />}
            </>
          )}
        </div>
      </main>

      {/* Barra Flutuante de Salvamento Reativo */}
      <FloatingSaveBar />

      {/* Diálogo de Confirmação para Ações Destrutivas */}
      <ConfirmDialog />

      {/* Drawer do Playground de Teste com IA Contextual */}
      <ChatDrawer />

      {/* Diálogos Modais do Sistema */}
      <QrCodeModal
        isOpen={activeModal === "qr" || activeModal === "pairing"}
        initialMode={activeModal === "pairing" ? "pairing" : "qr"}
        onClose={() => setActiveModal(null)}
      />

      <GoogleAuthModal
        isOpen={activeModal === "calendar"}
        onClose={() => setActiveModal(null)}
      />

      <PayloadJsonModal
        isOpen={activeModal === "json"}
        onClose={() => setActiveModal(null)}
      />

      <OnboardingWizardModal
        isOpen={activeModal === "wizard"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AgentConfigProvider>
      <Toaster
        position="top-right"
        richColors
        theme="light"
        closeButton
        toastOptions={{
          style: {
            fontFamily: "inherit",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          },
        }}
      />
      <AppContent />
    </AgentConfigProvider>
  );
}
