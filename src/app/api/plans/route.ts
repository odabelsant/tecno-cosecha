import { NextResponse } from "next/server";
import { SubscriptionsService, PlanTier } from "@/modules/identity/plans";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_demo_prod";

    const service = new SubscriptionsService();
    const subscription = service.getUserSubscription(userId);
    const availablePlans = service.getAvailablePlans();

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        availablePlans,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener suscripción";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, planTier } = body;

    if (!userId || !planTier) {
      return NextResponse.json(
        { success: false, error: "userId y planTier son requeridos" },
        { status: 400 }
      );
    }

    const service = new SubscriptionsService();
    const updated = service.updatePlan(userId, planTier as PlanTier);

    return NextResponse.json({
      success: true,
      message: `Plan actualizado exitosamente a ${planTier} (sin cargos recurrentes automáticos).`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar plan";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
