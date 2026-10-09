import React from "react";

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, style }) => {
  return (
    <article
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        boxShadow: "0 2px 6px rgba(36, 92, 58, 0.04)",
        marginBottom: "16px",
        ...style,
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: "14px", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
          {title && (
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-texto)", margin: 0 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div>{children}</div>
    </article>
  );
};
