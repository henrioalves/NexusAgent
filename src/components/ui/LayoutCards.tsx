import React from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = "",
}) => {
  return (
    <section className={`card ${className}`}>
      {(title || subtitle || action) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
};

export interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  children,
  hint,
  error,
  className = "",
}) => {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {error ? (
        <small className="text-red-500 font-medium">{error}</small>
      ) : (
        hint && <small>{hint}</small>
      )}
    </label>
  );
};

export interface SettingRowProps {
  title: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  control,
  className = "",
}) => {
  return (
    <div className={`setting-row ${className}`}>
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      {control}
    </div>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "danger" | "warning";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}) => {
  const variantClass = variant === "success" ? "success" : "";
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {dot && <span className={`dot ${variant === "success" ? "online" : ""}`} />}
      {children}
    </span>
  );
};

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  leftLabel,
  rightLabel,
  unit,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {(leftLabel || rightLabel || unit) && (
        <div className="range-labels">
          <span>{leftLabel}</span>
          {unit && <b>{value} {unit}</b>}
          <span>{rightLabel}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
      />
    </div>
  );
};

