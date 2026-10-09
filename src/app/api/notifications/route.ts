import { NextResponse } from "next/server";
import { NotificationsService } from "@/modules/notifications/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_demo_prod";
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const service = new NotificationsService();
    const notifications = service.getUserNotifications(userId, { unreadOnly });
    const unreadCount = service.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener notificaciones";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, notificationId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId es requerido" },
        { status: 400 }
      );
    }

    const service = new NotificationsService();

    if (action === "MARK_ALL_READ") {
      const updatedCount = service.markAllAsRead(userId);
      return NextResponse.json({
        success: true,
        message: `${updatedCount} notificaciones marcadas como leídas`,
      });
    }

    if (action === "MARK_READ" && notificationId) {
      service.markAsRead(notificationId, userId);
      return NextResponse.json({
        success: true,
        message: "Notificación marcada como leída",
      });
    }

    return NextResponse.json(
      { success: false, error: "Acción no reconocida o parámetros faltantes" },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar notificaciones";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
