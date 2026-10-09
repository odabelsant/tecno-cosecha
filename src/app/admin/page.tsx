"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MetricCard {
  label: string;
  value: number;
  icon: string;
}

interface AuditItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  date: string;
}

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  {
    id: "audit_1",
    actor: "admin_central",
    action: "FARM_VERIFIED",
    target: "u_farmer_moca",
    reason: "Inspección fotográfica de título de propiedad y cultivos en Moca.",
    date: "Hoy, 10:30 AM",
  },
  {
    id: "audit_2",
    actor: "admin_central",
    action: "POST_MODERATION",
    target: "post_9921",
    reason: "Publicación con precio fuera de banda de mercado referencial.",
    date: "Ayer, 04:15 PM",
  },
  {
    id: "audit_3",
    actor: "admin_central",
    action: "USER_STATUS_CHANGE",
    target: "u_susp_102",
    reason: "Incumplimiento reiterado de entregas acordadas.",
    date: "08-Oct, 02:00 PM",
  },
];

export default function AdminPage() {
  const [metrics] = useState<MetricCard[]>([
    { label: "Usuarios Registrados", value: 142, icon: "👥" },
    { label: "Publicaciones Activas", value: 38, icon: "📦" },
    { label: "Pedidos Formalizados", value: 65, icon: "🤝" },
    { label: "Incidencias Resueltas", value: 12, icon: "⚖️" },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS);
  const [actionType, setActionType] = useState<"USER" | "POST" | "VERIFY">("VERIFY");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim() || reason.trim().length < 5) {
      alert("Por favor completa el ID del objetivo y un motivo justificado (mínimo 5 caracteres).");
      return;
    }

    const actionMap = {
      USER: "USER_STATUS_CHANGE",
      POST: "POST_MODERATION",
      VERIFY: "FARM_VERIFIED",
    };

    const newLog: AuditItem = {
      id: "audit_" + Date.now().toString().slice(-4),
      actor: "admin_actual",
      action: actionMap[actionType],
      target: targetId.trim(),
      reason: reason.trim(),
      date: "Justo ahora",
    };

    setAuditLogs([newLog, ...auditLogs]);
    setStatusMessage(`Acción '${actionMap[actionType]}' registrada y auditada exitosamente en el servidor.`);
    setTargetId("");
    setReason("");
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <AppShell>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Badge variant="terracota">Fase 15: Administración</Badge>
              <Badge variant="bosque">Mínimo Privilegio</Badge>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#245C3A", marginTop: "0.5rem" }}>
              Panel de Supervisión y Auditoría
            </h1>
            <p style={{ color: "#4B5A50", margin: "0.25rem 0 0", fontSize: "0.95rem" }}>
              Control administrativo con registro inmutable de auditoría para cada intervención técnica.
            </p>
          </div>
        </div>

        {/* Alerta de Éxito */}
        {statusMessage && (
          <div
            style={{
              padding: "1rem",
              background: "#dcfce7",
              border: "1px solid #4D8A62",
              borderRadius: "8px",
              color: "#245C3A",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            ✅ {statusMessage}
          </div>
        )}

        {/* Tarjetas de Métricas KPI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DCD6C8",
                borderRadius: "12px",
                padding: "1.25rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{m.icon}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#253129" }}>{m.value}</div>
              <div style={{ fontSize: "0.85rem", color: "#4B5A50", fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Grid de Formulario y Trazabilidad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Formulario de Acción Moderada */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #DCD6C8",
              borderRadius: "14px",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#245C3A", marginBottom: "0.5rem" }}>
              Ejecutar Acción Moderada
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#4B5A50", marginBottom: "1rem" }}>
              Toda modificación queda registrada con tu identidad y motivo en el libro de auditoría.
            </p>

            <form onSubmit={handleExecuteAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "#253129" }}>
                  Tipo de Acción:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as "USER" | "POST" | "VERIFY")}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #DCD6C8",
                    background: "#FAF8F2",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="VERIFY">🛡️ Verificar Parcela / Finca (Gratuita)</option>
                  <option value="POST">📦 Moderar / Pausar Publicación</option>
                  <option value="USER">👤 Modificar Estado de Usuario</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "#253129" }}>
                  Identificador del Objetivo (Target ID):
                </label>
                <input
                  type="text"
                  placeholder="Ej. farmer_102 o post_5501"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #DCD6C8",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "#253129" }}>
                  Motivo / Justificación Obligatoria:
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica la causa de la intervención técnica..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #DCD6C8",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <Button type="submit" variant="primary" fullWidth size="large">
                Confirmar y Registrar en Auditoría
              </Button>
            </form>
          </div>

          {/* Reglas de Gobernanza e Inmutabilidad */}
          <div
            style={{
              background: "#FAF8F2",
              border: "1px solid #DCD6C8",
              borderRadius: "14px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#C8754D", marginBottom: "0.5rem" }}>
                Gobernanza y Regla de Inmutabilidad
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#4B5A50", lineHeight: 1.6 }}>
                En Tecno Cosecha, ningún rol tiene permisos para alterar términos de cotizaciones aceptadas ni reescribir pedidos en curso:
              </p>

              <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#253129", lineHeight: 1.6, marginTop: "0.75rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Cero Edición Unilateral:</strong> Los precios y volúmenes pactados en pedidos quedan congelados.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Trazabilidad Obligatoria:</strong> Cada acción administrativa guarda fecha, actor y motivo en <code>admin_audit_logs</code>.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Sin Multas Automáticas:</strong> Las controversias se median humanamente sin retenciones financieras automáticas.
                </li>
              </ul>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #DCD6C8",
                borderRadius: "8px",
                padding: "0.85rem",
                fontSize: "0.8rem",
                color: "#4B5A50",
                marginTop: "1rem",
              }}
            >
              🔒 <strong>Protección en el Servidor:</strong> Cualquier intento de sobrepasar permisos es rechazado a nivel de base de datos y middleware con código 403 Forbidden.
            </div>
          </div>
        </div>

        {/* Tabla de Registros de Auditoría */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCD6C8",
            borderRadius: "14px",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#245C3A", margin: 0 }}>
              Libro Inmutable de Auditoría ({auditLogs.length} eventos)
            </h2>
            <Badge variant="neutral">Solo Lectura</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: "#FAF8F2",
                  border: "1px solid #EFECE1",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <Badge variant="bosque">{log.action}</Badge>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#253129" }}>
                      Objetivo: {log.target}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#4B5A50" }}>• Por: {log.actor}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#4B5A50" }}>
                    <strong>Motivo:</strong> {log.reason}
                  </p>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4B5A50", fontWeight: 600 }}>
                  {log.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
