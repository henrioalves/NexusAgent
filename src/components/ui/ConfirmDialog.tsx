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
          className={`w-12 h-12 rounded-full grid place-items-center mb-4 ${
            isDestructive
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed max-w-xs">{message}</p>
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

