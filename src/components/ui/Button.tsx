import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "terracotta" | "outline";
  size?: "large" | "medium";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "large",
  fullWidth = false,
  children,
  style,
  disabled,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return "#D1D5DB";
    switch (variant) {
      case "primary":
        return "var(--color-verde-bosque)";
      case "secondary":
        return "var(--color-verde-hoja)";
      case "terracotta":
        return "var(--color-terracota)";
      case "outline":
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (disabled) return "#6B7280";
    if (variant === "outline") return "var(--color-verde-bosque)";
    return "#FFFFFF";
  };

  const getBorder = () => {
    if (disabled) return "1px solid #D1D5DB";
    if (variant === "outline") return "2px solid var(--color-verde-bosque)";
    return "none";
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    minHeight: size === "large" ? "var(--touch-target-min)" : "40px",
    padding: size === "large" ? "12px 24px" : "8px 16px",
    fontSize: size === "large" ? "1.05rem" : "0.95rem",
    fontWeight: 700,
    fontFamily: "var(--font-sans)",
    color: getTextColor(),
    backgroundColor: getBackgroundColor(),
    border: getBorder(),
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    textDecoration: "none",
    boxShadow: disabled ? "none" : "0 2px 4px rgba(0,0,0,0.06)",
    ...style,
  };

  return (
    <button style={baseStyle} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
