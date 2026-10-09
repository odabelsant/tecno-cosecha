import { NextRequest, NextResponse } from "next/server";
import { CatalogService } from "@/modules/catalog";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId") || undefined;

  try {
    const service = new CatalogService();
    const products = service.listProducts(categoryId);
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido al consultar el catálogo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
