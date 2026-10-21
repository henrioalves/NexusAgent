import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { useAgentConfig } from "../../context/AgentConfigContext";

export const ConfirmDialog: React.FC = () => {
  const { confirmModal, closeConfirm } = useAgentConfig();

  useEffect(() => {
    if (!confirmModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmModal, closeConfirm]);

  if (!confirmModal) return null;

  const {
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    isDestructive = false,
    onConfirm,
  } = confirmModal;

  const handleConfirm = () => {
    onConfirm();
    closeConfirm();
  };

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeConfirm();
        }
      }}
    >
      <div className="modal max-w-sm text-center flex flex-col items-center p-6">
        <div
          className={`w-12 h-12 rounded-full grid place-items-center mb-4 transition-colors ${
            isDestructive
              ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
          }`}
        >
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#f5f5f7] mb-2">{title}</h3>
        <p className="text-xs text-gray-600 dark:text-[#98989d] mb-6 leading-relaxed max-w-xs">{message}</p>
        <div className="flex gap-2 w-full justify-center">
          <Button variant="secondary" onClick={closeConfirm} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

