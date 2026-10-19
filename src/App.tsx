import React from "react";
import { Toaster } from "sonner";
import { AgentConfigProvider, useAgentConfig } from "./context/AgentConfigContext";
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
  const { activeTab, activeModal, setActiveModal } = useAgentConfig();

  return (
    <div className="app-shell">
      <Header />
      <main>
        <TabBar />
        <div className="page">
          <PageTitle />
          {activeTab === "connections" && <ConnectionsTab />}
          {activeTab === "contacts" && <AttendanceTab />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "identity" && <IdentityTab />}
          {activeTab === "knowledge" && <KnowledgeBaseTab />}
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
