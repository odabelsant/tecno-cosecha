"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "🌱" },
  { href: "/catalogo", label: "Catálogo", icon: "📦" },
  { href: "/publicar", label: "Publicar", icon: "📝" },
  { href: "/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/planes", label: "Planes", icon: "⭐" },
  { href: "/ayuda", label: "Ayuda", icon: "💡" },
  { href: "/admin", label: "Admin", icon: "🛡️" },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      {/* Header Superior Accesible */}
      <header className="shell-header">
        <div className="header-container">
          <Link href="/" className="brand-link" aria-label="Tecno Cosecha - Ir al Inicio">
            <span>🌱</span>
            <span>Tecno Cosecha</span>
          </Link>

          {/* Navegación visible solo en escritorio (md+) */}
          <nav className="header-nav-desktop" aria-label="Navegación principal de escritorio">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive ? "true" : "false"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span aria-hidden="true" style={{ marginRight: "6px" }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="shell-main" id="main-content">
        {children}
      </main>

      {/* Barra de Navegación Inferior (Mobile-first, fija abajo) */}
      <nav className="mobile-bottom-nav" aria-label="Navegación inferior móvil">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-nav-item"
              data-active={isActive ? "true" : "false"}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
