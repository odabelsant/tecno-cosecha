"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  id: string;
  eventType: string;
  title: string;
  message: string;
  isRead: boolean;
  timeAgo: string;
}

interface Tutorial {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  externalUrl: string | null;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    eventType: "QUOTE_RECEIVED",
    title: "Nueva propuesta de cotización recibida",
    message: "Supermercado El Sol envió propuesta por 50 Quintales de Plátano Macho a RD$ 1,450.00 c/u.",
    isRead: false,
    timeAgo: "Hace 10 min",
  },
  {
    id: "notif_2",
    eventType: "ORDER_STATUS_CHANGED",
    title: "Actualización de Pedido: TC-ORD-1002",
    message: "El vendedor marcó el camión en camino hacia el punto de acopio.",
    isRead: false,
    timeAgo: "Hace 1 hora",
  },
  {
    id: "notif_3",
    eventType: "QUOTE_ACCEPTED",
    title: "Cotización formalmente aceptada",
    message: "Tu cotización para 100 Libras de Tomate Barceló fue aceptada. Los términos quedan congelados.",
    isRead: true,
    timeAgo: "Ayer",
  },
];

const CANONICAL_FAQS = [
  {
    q: "¿Cómo publico mi cosecha para vender?",
    a: "Presiona el botón 'Publicar', escribe qué producto tienes (ej. Plátano o Yuca), la cantidad de sacos o quintales y el precio por unidad. Tu oferta saldrá de inmediato para que colmados y mayoristas la vean.",
  },
  {
    q: "¿Cómo y cuándo me pagan mi cosecha?",
    a: "El pago se realiza directamente entre tú y el comprador (en efectivo o transferencia acordada) al momento de la entrega e inspección física. Tecno Cosecha no retiene dinero ni cobra comisiones bancarias.",
  },
  {
    q: "¿Qué pasa si un comprador me ofrece un precio distinto?",
    a: "El comprador te mandará una 'Contrapropuesta'. Verás el nuevo precio en tus Pedidos. Si te conviene, le das a 'Aceptar'; si no, puedes rechazarla o mandar otro precio. Nadie puede alterar el acuerdo a tus espaldas.",
  },
  {
    q: "¿Qué hago si la cosecha llega con menos peso o dañada?",
    a: "Al recibir el transporte, anota la cantidad exacta que recibiste en buen estado ('recepción parcial'). Si hay problema grave, abre un reclamo con foto y descripción antes de 24 horas para que el equipo de Tecno Cosecha medie el caso.",
  },
  {
    q: "¿Tengo que pagar un plan para que verifiquen mi finca?",
    a: "No. La verificación básica de tu finca o negocio es completamente gratuita en cualquier plan (incluso en Explora). Solo debes presentar tus datos reales.",
  },
];

const TUTORIALS: Tutorial[] = [
  {
    id: "tut_1",
    title: "Guía 1: Publicar cosecha paso a paso",
    summary: "Instrucciones directas para mostrar tu producto a compradores del país.",
    steps: [
      "1. Presiona el botón verde 'Publicar' en el menú principal.",
      "2. Elige si estás 'Vendiendo cosecha' o 'Buscando comprar'.",
      "3. Selecciona tu rubro y la unidad de medida (ej. Quintal QQ o Libra LB).",
      "4. Pon el precio por unidad en pesos dominicanos (RD$).",
      "5. Guarda la publicación. ¡Listo! Ya estás visible.",
    ],
    externalUrl: null,
  },
  {
    id: "tut_2",
    title: "Guía 2: Negociar y aceptar cotizaciones",
    summary: "Cómo acordar precios justos con protección total y sin sorpresas.",
    steps: [
      "1. Revisa la solicitud en tu sección de 'Pedidos'.",
      "2. Observa la cantidad, la fecha de corte y el precio propuesto.",
      "3. Si estás de acuerdo, presiona 'Aceptar Cotización'.",
      "4. Si quieres ajustar el precio, envía una 'Contrapropuesta'.",
      "5. Una vez aceptada por ambas partes, el precio queda congelado e inalterable.",
    ],
    externalUrl: null,
  },
  {
    id: "tut_3",
    title: "Guía 3: Despacho y entrega en el campo",
    summary: "Cómo registrar que la carga salió y confirmar la llegada.",
    steps: [
      "1. Cuando estés empacando, marca el pedido como 'En Preparación'.",
      "2. Al salir el transporte hacia el punto de encuentro, cámbialo a 'En Camino'.",
      "3. El comprador inspecciona el producto en persona y confirma 'Entregado'.",
      "4. Se realiza el pago directo acordado mano a mano.",
    ],
    externalUrl: null,
  },
];

export default function AyudaPage() {
  const [activeTab, setActiveTab] = useState<"notif" | "faq" | "guias">("notif");
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <AppShell>
      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Encabezado */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <Badge variant="bosque">Fase 14: Notificaciones y Ayuda</Badge>
          <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#245C3A", marginTop: "0.5rem" }}>
            Centro de Ayuda y Avisos
          </h1>
          <p style={{ color: "#4B5A50", maxWidth: "580px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
            Avisos claros de tus cosechas, respuestas directas en lenguaje sencillo y guías prácticas para el campo.
          </p>
        </div>

        {/* Pestañas de navegación de ayuda */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            background: "#FAF8F2",
            padding: "0.35rem",
            borderRadius: "10px",
            border: "1px solid #DCD6C8",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() => setActiveTab("notif")}
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: activeTab === "notif" ? "#245C3A" : "transparent",
              color: activeTab === "notif" ? "#FFFFFF" : "#253129",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            🔔 Notificaciones {unreadCount > 0 && <span style={{ background: "#C8754D", color: "#fff", borderRadius: "999px", padding: "1px 7px", fontSize: "0.75rem" }}>{unreadCount}</span>}
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: activeTab === "faq" ? "#245C3A" : "transparent",
              color: activeTab === "faq" ? "#FFFFFF" : "#253129",
            }}
          >
            ❓ Preguntas Frecuentes
          </button>

          <button
            onClick={() => setActiveTab("guias")}
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              background: activeTab === "guias" ? "#245C3A" : "transparent",
              color: activeTab === "guias" ? "#FFFFFF" : "#253129",
            }}
          >
            📖 Guías y Tutoriales
          </button>
        </div>

        {/* 1. SECCIÓN DE NOTIFICACIONES */}
        {activeTab === "notif" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "#253129" }}>
                Avisos de Negociación y Pedidos ({unreadCount} pendientes)
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="medium" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </Button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    background: notif.isRead ? "#FFFFFF" : "#FAF8F2",
                    border: notif.isRead ? "1px solid #DCD6C8" : "1.5px solid #245C3A",
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      {!notif.isRead && (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C8754D" }} />
                      )}
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#253129" }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#4B5A50" }}>• {notif.timeAgo}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#4B5A50", lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <Button variant="outline" size="medium" onClick={() => markSingleAsRead(notif.id)}>
                      Leído
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#4B5A50", textAlign: "center" }}>
              🔒 <strong>Privacidad:</strong> Las notificaciones no exponen números de cuentas ni datos privados.
            </div>
          </div>
        )}

        {/* 2. SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) */}
        {activeTab === "faq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {CANONICAL_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCD6C8",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "1rem 1.25rem",
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#245C3A",
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: "1.2rem", color: "#4B5A50" }}>{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 1.25rem 1rem",
                        color: "#4B5A50",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        borderTop: "1px solid #FAF8F2",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. SECCIÓN DE GUÍAS Y TUTORIALES */}
        {activeTab === "guias" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {TUTORIALS.map((tut) => (
              <div
                key={tut.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #DCD6C8",
                  borderRadius: "12px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#245C3A", margin: 0 }}>
                    {tut.title}
                  </h3>
                  <Badge variant="hoja">Paso a Paso</Badge>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#4B5A50", marginBottom: "1rem" }}>
                  {tut.summary}
                </p>

                <div
                  style={{
                    background: "#FAF8F2",
                    borderRadius: "8px",
                    padding: "0.85rem 1rem",
                    borderLeft: "4px solid #245C3A",
                  }}
                >
                  <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.875rem", color: "#253129", lineHeight: 1.6 }}>
                    {tut.steps.map((st, i) => (
                      <li key={i} style={{ marginBottom: "0.35rem" }}>
                        {st}
                      </li>
                    ))}
                  </ol>
                </div>

                <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#4B5A50", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>✓ Formato optimizado para conexiones móviles lentas.</span>
                  {tut.externalUrl ? (
                    <a href={tut.externalUrl} target="_blank" rel="noreferrer" style={{ color: "#245C3A", fontWeight: 700 }}>
                      Ver recurso oficial &rarr;
                    </a>
                  ) : (
                    <span style={{ fontStyle: "italic" }}>Recurso integrado en plataforma</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
