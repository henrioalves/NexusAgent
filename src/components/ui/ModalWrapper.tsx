import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "wide";
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  subtitle,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`modal ${maxWidth === "wide" ? "wide" : ""}`}>
        <div className="modal-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          <Button variant="ghost" icon={X} onClick={onClose} aria-label="Fechar modal" />
        </div>
        {children}
      </div>
    </div>
  );
};

