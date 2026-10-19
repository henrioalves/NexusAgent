import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, suffix, ...props }, ref) => {
    if (suffix) {
      return (
        <div className="input-suffix w-full">
          <input
            ref={ref}
            className={`input ${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
            {...props}
          />
          <span>{suffix}</span>
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`input ${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ className = "", children, error, ...props }) => {
  return (
    <select
      className={`input select ${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", error, ...props }) => {
  return (
    <textarea
      className={`input textarea ${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
      {...props}
    />
  );
};

