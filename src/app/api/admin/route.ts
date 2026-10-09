import { NextResponse } from "next/server";
import { AdminService } from "@/modules/admin/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actorId") || "admin_demo";

    const service = new AdminService();
    const metrics = service.getSystemMetrics(actorId);
    const auditLogs = service.getAuditLogs(actorId, 25);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        auditLogs,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error en panel administrativo";
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("Acceso denegado") ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actorId, action, targetId, newStatus, reason, mediationNotes } = body;

    if (!actorId || !action || !targetId || !reason) {
      return NextResponse.json(
        { success: false, error: "actorId, action, targetId y reason son requeridos" },
        { status: 400 }
      );
    }

    const service = new AdminService();

    if (action === "USER_STATUS_CHANGE") {
      service.updateUserStatus(actorId, targetId, newStatus, reason);
      return NextResponse.json({ success: true, message: "Estado de usuario actualizado y auditado." });
    }

    if (action === "POST_MODERATION") {
      service.moderatePost(actorId, targetId, newStatus, reason);
      return NextResponse.json({ success: true, message: "Publicación moderada y auditada." });
    }

    if (action === "INCIDENT_RESOLVED" || action === "INCIDENT_REJECTED") {
      const resolution = action === "INCIDENT_RESOLVED" ? "RESUELTA" : "RECHAZADA";
      service.resolveIncident(actorId, targetId, resolution, mediationNotes || "", reason);
      return NextResponse.json({ success: true, message: `Incidencia ${resolution.toLowerCase()} y auditada.` });
    }

    if (action === "FARM_VERIFIED") {
      service.verifyFarm(actorId, targetId, true, mediationNotes || "Verificación documental", reason);
      return NextResponse.json({ success: true, message: "Finca verificada gratuitamente y auditada." });
    }

    return NextResponse.json(
      { success: false, error: `Acción administrativa no soportada: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error procesando acción administrativa";
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("Acceso denegado") ? 403 : 500 }
    );
  }
}
