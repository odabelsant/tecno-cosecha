import { NextRequest, NextResponse } from "next/server";
import { DiscoveryService, SearchFilterParams } from "@/modules/publications";
import { AgriculturalUnit } from "@/modules/catalog/units";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: SearchFilterParams = {
    query: params.get("query") || undefined,
    post_type: (params.get("post_type") as SearchFilterParams["post_type"]) || undefined,
    category_id: params.get("category_id") || undefined,
    province: params.get("province") || undefined,
    unit: (params.get("unit") as AgriculturalUnit) || undefined,
    min_quantity: params.get("min_quantity") ? parseFloat(params.get("min_quantity")!) : undefined,
    max_price: params.get("max_price") ? parseFloat(params.get("max_price")!) : undefined,
    page: params.get("page") ? parseInt(params.get("page")!, 10) : 1,
    limit: params.get("limit") ? parseInt(params.get("limit")!, 10) : 20,
  };

  try {
    const service = new DiscoveryService();
    const result = service.searchPosts(filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al buscar publicaciones";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
