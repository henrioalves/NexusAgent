import React from "react";
import { Check as CheckIcon } from "lucide-react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  green?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  green = false,
  disabled = false,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`switch ${checked ? "on" : ""} ${green ? "green" : ""} ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span />
    </button>
  );
};

export interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  compact = false,
  className = "",
}) => {
  return (
    <div className={`segmented ${compact ? "compact" : ""} ${className}`}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={value === option ? "selected" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label className={`check ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        className={checked ? "checked" : ""}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && <CheckIcon size={12} strokeWidth={2.5} />}
      </button>
      <span>{label}</span>
    </label>
  );
};

