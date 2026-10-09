import React from "react";

export interface BadgeProps {
  variant?: "bosque" | "hoja" | "terracota" | "neutral";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "bosque", children }) => {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case "bosque":
        return { backgroundColor: "var(--color-verde-bosque)", color: "#FFFFFF" };
      case "hoja":
        return { backgroundColor: "var(--color-verde-hoja)", color: "#FFFFFF" };
      case "terracota":
        return { backgroundColor: "var(--color-terracota)", color: "#FFFFFF" };
      case "neutral":
        return { backgroundColor: "var(--color-surface-muted)", color: "var(--color-texto)", border: "1px solid var(--color-border)" };
    }
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: "0.825rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        ...getStyles(),
      }}
    >
      {children}
    </span>
  );
};
