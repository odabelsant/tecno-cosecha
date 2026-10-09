import React from "react";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  id,
  required,
  style,
  ...props
}) => {
  return (
    <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        htmlFor={id}
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--color-texto)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--color-terracota)" }} aria-hidden="true">*</span>}
      </label>

      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        style={{
          minHeight: "var(--touch-target-min)",
          padding: "10px 14px",
          fontSize: "1rem",
          fontFamily: "var(--font-sans)",
          color: "var(--color-texto)",
          backgroundColor: "#FFFFFF",
          border: error ? "2px solid var(--color-error)" : "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          ...style,
        }}
        {...props}
      />

      {helperText && !error && (
        <span id={`${id}-helper`} style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          {helperText}
        </span>
      )}

      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: "0.85rem",
            color: "var(--color-error)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
