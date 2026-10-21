import React, { useState, useEffect } from "react";

/**
 * Extrai as duas primeiras iniciais do nome completo (ex: "Eduardo Moreira" -> "EM", "Maria" -> "MA").
 * Caso não haja nome cadastrado, usa o início do e-mail.
 */
export const getUserInitials = (fullName?: string | null, email?: string | null): string => {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].toUpperCase();
    }
  }

  if (email && email.trim().length > 0) {
    const userPart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    return userPart.slice(0, 2).toUpperCase() || "NA";
  }

  return "NA";
};

export interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Componente unificado de Avatar no padrão Apple/iOS Monochrome.
 * Garante tipografia, peso de fonte, cores e proporções perfeitamente padronizadas.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  email,
  size = "sm",
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getUserInitials(name, email);

  // Redefine o estado de erro caso a URL seja atualizada
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const sizeClasses = {
    sm: "w-9 h-9 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }[size];

  return (
    <div
      className={`rounded-full bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center font-sans font-semibold border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] antialiased select-none overflow-hidden flex-shrink-0 transition-colors ${sizeClasses} ${className}`}
    >
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="leading-none tracking-tight font-sans font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          {initials}
        </span>
      )}
    </div>
  );
};

