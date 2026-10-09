import { NextRequest, NextResponse } from "next/server";
import { OrdersService, OrderStatus } from "@/modules/orders";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") || undefined;
  const orderId = request.nextUrl.searchParams.get("orderId") || undefined;

  try {
    const service = new OrdersService();
    if (orderId) {
      const order = service.getOrderById(orderId);
      const timeline = service.getOrderTimeline(orderId);
      return NextResponse.json({ success: true, order, timeline });
    }

    if (userId) {
      const orders = service.listOrdersForUser(userId);
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({ success: true, orders: [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al consultar pedidos";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = new OrdersService();

    if (body.action === "create_from_quote") {
      const order = service.createOrderFromQuote(body.quoteId, body.actorId);
      return NextResponse.json({ success: true, order });
    }

    if (body.action === "transition") {
      const order = service.transitionOrderStatus(
        body.orderId,
        body.nextStatus as OrderStatus,
        body.actorId,
        { notes: body.notes, receivedQuantity: body.receivedQuantity }
      );
      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar pedido";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
