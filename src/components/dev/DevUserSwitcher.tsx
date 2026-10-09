"use client";

import React, { useState, useEffect, useMemo } from "react";

export interface DemoUser {
  id: string;
  email: string;
  phone: string;
  role: "FARMER" | "BUYER" | "ADMIN";
  full_name: string;
  business_name: string;
  province: string;
  municipality: string;
  business_type?: string;
  plan_tier: string;
  active_posts_count: number;
}

export function DevUserSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [activeUser, setActiveUser] = useState<DemoUser | null>(null);
  const [activeTab, setActiveTab] = useState<"FARMER" | "BUYER" | "ADMIN">("FARMER");
  const [search, setSearch] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Cargar usuarios desde la API y restaurar usuario activo de localStorage
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/dev/users");
        const json = await res.json();
        if (json.success && json.data?.all) {
          const list: DemoUser[] = json.data.all;
          setUsers(list);

          const savedId = localStorage.getItem("tc_active_demo_user_id");
          const found = list.find((u) => u.id === savedId);
          if (found) {
            setActiveUser(found);
          } else if (list.length > 0) {
            // Default: primer vendedor (Don Ramón Gómez)
            const defaultUser = list[0];
            setActiveUser(defaultUser);
            localStorage.setItem("tc_active_demo_user_id", defaultUser.id);
            localStorage.setItem("tc_active_demo_user", JSON.stringify(defaultUser));
          }
        }
      } catch (err) {
        console.error("Error cargando usuarios demo:", err);
      }
    }

    loadUsers();
  }, []);

  const selectUser = (user: DemoUser) => {
    setActiveUser(user);
    localStorage.setItem("tc_active_demo_user_id", user.id);
    localStorage.setItem("tc_active_demo_user", JSON.stringify(user));

    // Despachar evento para componentes que escuchen cambios de usuario
    window.dispatchEvent(
      new CustomEvent("tc-demo-user-changed", {
        detail: user,
      })
    );

    setIsOpen(false);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopyFeedback(text);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesTab = u.role === activeTab;
      if (!matchesTab) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.business_name.toLowerCase().includes(q) ||
        u.province.toLowerCase().includes(q) ||
        u.municipality.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, activeTab, search]);

  const sellersCount = users.filter((u) => u.role === "FARMER").length;
  const buyersCount = users.filter((u) => u.role === "BUYER").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <>
      {/* Botón Flotante Inferior Derecho */}
      <div
        className="dev-switcher-trigger"
        style={{
          position: "fixed",
          bottom: "76px",
          right: "16px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Selector de cuentas de prueba"
          style={{
            background: "linear-gradient(135deg, #245C3A 0%, #1A442A 100%)",
            color: "#FFFFFF",
            border: "2px solid #F7F5EC",
            boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
            borderRadius: "30px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          <span style={{ fontSize: "16px" }}>
            {activeUser?.role === "FARMER"
              ? "👨‍🌾"
              : activeUser?.role === "BUYER"
              ? "🛒"
              : "🛡️"}
          </span>
          <div style={{ textAlign: "left", lineHeight: "1.2" }}>
            <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.85 }}>
              DEMO ACTIVO · {activeUser?.role === "FARMER" ? "Vendedor" : activeUser?.role === "BUYER" ? "Comprador" : "Admin"}
            </div>
            <div style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeUser?.full_name || "Cargando..."}
            </div>
          </div>
          <span style={{ marginLeft: "4px", fontSize: "11px", opacity: 0.9 }}>
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {/* Modal / Panel Flotante de Selección */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Selector de cuentas de desarrollo"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(37, 49, 41, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "620px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 35px rgba(0,0,0,0.25)",
              overflow: "hidden",
              border: "1px solid #DCD6C8",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div
              style={{
                backgroundColor: "#245C3A",
                color: "#FFFFFF",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🌱</span> Selector Rápido de Cuentas Demo
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.9 }}>
                  Alterna en 1 clic para probar flujos (vender, cotizar, comprar y moderar en RD)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Pestañas de Roles */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #DCD6C8",
                backgroundColor: "#F7F5EC",
                padding: "8px 16px 0",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("FARMER")}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: activeTab === "FARMER" ? 700 : 500,
                  color: activeTab === "FARMER" ? "#245C3A" : "#4B5A50",
                  border: "none",
                  background: activeTab === "FARMER" ? "#FFFFFF" : "transparent",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  borderBottom: activeTab === "FARMER" ? "3px solid #245C3A" : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                👨‍🌾 Vendedores ({sellersCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("BUYER")}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: activeTab === "BUYER" ? 700 : 500,
                  color: activeTab === "BUYER" ? "#245C3A" : "#4B5A50",
                  border: "none",
                  background: activeTab === "BUYER" ? "#FFFFFF" : "transparent",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  borderBottom: activeTab === "BUYER" ? "3px solid #245C3A" : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                🛒 Compradores ({buyersCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ADMIN")}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: activeTab === "ADMIN" ? 700 : 500,
                  color: activeTab === "ADMIN" ? "#245C3A" : "#4B5A50",
                  border: "none",
                  background: activeTab === "ADMIN" ? "#FFFFFF" : "transparent",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  borderBottom: activeTab === "ADMIN" ? "3px solid #245C3A" : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                🛡️ Admin ({adminCount})
              </button>
            </div>

            {/* Barra de Filtro / Búsqueda */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #EFECE1", backgroundColor: "#FFFFFF" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nombre, cultivo, comercio o provincia..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "1px solid #DCD6C8",
                  outline: "none",
                }}
              />
            </div>

            {/* Lista de Usuarios */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "#FAF9F5",
              }}
            >
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#666", fontSize: "13px" }}>
                  No se encontraron usuarios para este criterio.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = activeUser?.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => selectUser(user)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        backgroundColor: isCurrent ? "#F2F8F4" : "#FFFFFF",
                        border: isCurrent ? "2px solid #245C3A" : "1px solid #DCD6C8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "#253129" }}>
                            {user.full_name}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: user.role === "FARMER" ? "#DCFCE7" : user.role === "BUYER" ? "#E0F2FE" : "#FEE2E2",
                              color: user.role === "FARMER" ? "#166534" : user.role === "BUYER" ? "#0369A1" : "#991B1B",
                              fontWeight: 600,
                            }}
                          >
                            {user.plan_tier}
                          </span>
                          {user.active_posts_count > 0 && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                fontWeight: 600,
                              }}
                            >
                              📦 {user.active_posts_count} {user.active_posts_count === 1 ? "publicación" : "publicaciones"}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: "12px", color: "#4B5A50", marginTop: "2px", fontWeight: 500 }}>
                          🏢 {user.business_name}
                        </div>

                        <div style={{ fontSize: "11px", color: "#666", marginTop: "2px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <span>📍 {user.province} ({user.municipality})</span>
                          <span>📞 {user.phone}</span>
                        </div>

                        <div style={{ fontSize: "11px", color: "#888", marginTop: "3px" }}>
                          <code>{user.email}</code>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(user.email, e)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#245C3A",
                              cursor: "pointer",
                              fontSize: "11px",
                              marginLeft: "6px",
                              textDecoration: "underline",
                            }}
                          >
                            {copyFeedback === user.email ? "✓ Copiado" : "Copiar"}
                          </button>
                        </div>
                      </div>

                      {/* Botón Acción */}
                      <div>
                        {isCurrent ? (
                          <span
                            style={{
                              backgroundColor: "#245C3A",
                              color: "#FFFFFF",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "inline-block",
                            }}
                          >
                            ✓ Activo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectUser(user);
                            }}
                            style={{
                              backgroundColor: "#F7F5EC",
                              color: "#245C3A",
                              border: "1px solid #245C3A",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Elegir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie con Resumen */}
            <div
              style={{
                padding: "10px 16px",
                backgroundColor: "#EFECE1",
                borderTop: "1px solid #DCD6C8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#4B5A50",
              }}
            >
              <span>
                Usuario activo: <strong>{activeUser?.full_name}</strong> ({activeUser?.role})
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#245C3A",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
