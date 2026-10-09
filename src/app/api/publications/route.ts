import { NextRequest, NextResponse } from "next/server";
import { DiscoveryService, SearchFilterParams, PublicationsService } from "@/modules/publications";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      category_id,
      unit,
      quantity,
      price_per_unit,
      province,
      municipality,
      variety,
      description,
      post_type = "OFERTA",
      target_date,
      image_url,
      user_id = "usr_vend_01",
    } = body;

    if (!title || !category_id || !unit || quantity === undefined || price_per_unit === undefined) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios para la publicación." },
        { status: 400 }
      );
    }

    const service = new PublicationsService();
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPost = service.createPost(
      {
        id: postId,
        post_type: post_type as "OFERTA" | "DEMANDA",
        category_id,
        title,
        variety: variety || undefined,
        description: description || undefined,
        unit,
        quantity: Number(quantity),
        price_per_unit: Number(price_per_unit),
        target_date: target_date || new Date().toISOString().split("T")[0],
        province: province || "La Vega",
        municipality: municipality || "Constanza",
        image_url: image_url || undefined,
        status: "ACTIVA",
      },
      user_id
    );

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear la publicación";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
