import React from "react";
import { type LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconSize?: number;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary",
  icon: Icon,
  iconPosition = "left",
  iconSize = 16,
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="spinner w-4 h-4 mr-1 inline-block" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={iconSize} className="icon" />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={iconSize} className="icon" />}
    </button>
  );
};

