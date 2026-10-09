import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Cargando información del campo...",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        textAlign: "center",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-border)",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          border: "4px solid var(--color-border)",
          borderTopColor: "var(--color-verde-bosque)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontWeight: 700, color: "var(--color-texto)", fontSize: "1.05rem", margin: 0 }}>
        {message}
      </p>
      <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "6px" }}>
        Por favor espere un momento
      </span>
    </div>
  );
};

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        textAlign: "center",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: "2.5rem",
          marginBottom: "12px",
          color: "var(--color-verde-hoja)",
        }}
        aria-hidden="true"
      >
        🌾
      </div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-texto)", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ maxWidth: "420px", color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
        {description}
      </p>
      {actionText && actionHref && (
        <Link href={actionHref} style={{ textDecoration: "none" }}>
          <Button variant="primary">
            {actionText}
          </Button>
        </Link>
      )}
      {actionText && !actionHref && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "No se pudo cargar la información",
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        backgroundColor: "var(--color-error-bg)",
        border: "2px solid var(--color-error-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "8px" }} aria-hidden="true">
        ⚠️
      </div>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-error)", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ maxWidth: "440px", color: "var(--color-texto)", fontSize: "0.95rem", marginBottom: "20px" }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="terracotta" onClick={onRetry}>
          🔄 Reintentar operación
        </Button>
      )}
    </div>
  );
};
