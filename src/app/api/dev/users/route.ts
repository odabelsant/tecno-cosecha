import { NextResponse } from "next/server";
import { getDatabase } from "@/db/connection";

export interface DemoUserProfile {
  id: string;
  email: string;
  phone: string;
  role: "FARMER" | "BUYER" | "ADMIN";
  full_name: string;
  business_name: string;
  province: string;
  municipality: string;
  plan_tier: string;
  active_posts_count: number;
  business_type?: string;
  description?: string;
}

export async function GET() {
  try {
    const db = getDatabase();

    // Consultar todos los usuarios de prueba @tecnocosecha.test
    const rows = db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.phone,
        u.role,
        COALESCE(fp.farm_name, bp.business_name, 'Administración') as business_name,
        COALESCE(fp.province, 'Santo Domingo') as province,
        COALESCE(fp.municipality, bp.delivery_address, 'Distrito Nacional') as municipality,
        COALESCE(bp.buyer_type, CASE WHEN u.role = 'FARMER' THEN 'PRODUCTOR_AGRICOLA' ELSE 'SISTEMA' END) as business_type,
        COALESCE(s.plan_tier, 'EXPLORA') as plan_tier,
        (SELECT COUNT(*) FROM marketplace_posts p WHERE p.user_id = u.id AND p.status = 'ACTIVA') as active_posts_count
      FROM users u
      LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
      LEFT JOIN buyer_profiles bp ON bp.user_id = u.id
      LEFT JOIN user_subscriptions s ON s.user_id = u.id
      WHERE u.email LIKE '%@tecnocosecha.test'
      ORDER BY 
        CASE u.role 
          WHEN 'FARMER' THEN 1 
          WHEN 'BUYER' THEN 2 
          ELSE 3 
        END,
        u.id ASC
    `).all() as Array<{
      id: string;
      email: string;
      phone: string;
      role: string;
      business_name: string;
      province: string;
      municipality: string;
      business_type: string;
      plan_tier: string;
      active_posts_count: number;
    }>;

    // Nombres humanizados acordes a cada perfil
    const farmerNames: Record<string, string> = {
      usr_vend_01: "Don Ramón Gómez",
      usr_vend_02: "Ing. Rafael Batista",
      usr_vend_03: "Lic. Manuel Disla",
      usr_vend_04: "Don Pedro Soto Báez",
      usr_vend_05: "Doña Altagracia Matos",
      usr_vend_06: "Don Fernando Alcántara",
      usr_vend_07: "Don José Antonio Camacho",
      usr_vend_08: "Ing. Marcos Ortiz",
      usr_vend_09: "Don Beltrán Féliz",
      usr_vend_10: "Doña Cristina de León",
    };

    const buyerNames: Record<string, string> = {
      usr_comp_01: "Lic. Francisco Morales (Compras)",
      usr_comp_02: "Dra. María Elena Díaz (Abastecimiento)",
      usr_comp_03: "Don Nelson Cabrera (Propietario)",
      usr_comp_04: "Don Tomás Peguero (Puesto Mercado)",
      usr_comp_05: "Chef Gabriel Mendoza (Producción)",
      usr_comp_06: "Ing. Lucía Ventura (Gerente Compras)",
      usr_comp_07: "Don Kelvin Rosario (Propietario)",
      usr_comp_08: "Lic. Andrea Sterling (Compras)",
      usr_comp_09: "Chef Carlos Henríquez (Director Alimentos)",
      usr_comp_10: "Don Ramón Elías (Comercializadora)",
    };

    const users: DemoUserProfile[] = rows.map((r) => {
      let full_name = "Usuario Tecno Cosecha";
      const isFarmer = r.role === "FARMER";
      const isBuyer = r.role === "BUYER_BUSINESS" || r.role === "BUYER_INDIVIDUAL" || (r.role as string) === "BUYER";
      const isAdmin = r.role === "ADMIN";

      if (isFarmer) {
        full_name = farmerNames[r.id] || `Productor (${r.business_name})`;
      } else if (isBuyer) {
        full_name = buyerNames[r.id] || `Comprador (${r.business_name})`;
      } else if (isAdmin) {
        full_name = "Administrador Tecno Cosecha";
      }

      const roleMapped = isFarmer ? "FARMER" : isBuyer ? "BUYER" : "ADMIN";

      return {
        id: r.id,
        email: r.email,
        phone: r.phone,
        role: roleMapped,
        full_name,
        business_name: r.business_name,
        province: r.province,
        municipality: r.municipality,
        business_type: r.business_type,
        plan_tier: r.plan_tier,
        active_posts_count: r.active_posts_count,
      };
    });

    const sellers = users.filter((u) => u.role === "FARMER");
    const buyers = users.filter((u) => u.role === "BUYER");
    const admins = users.filter((u) => u.role === "ADMIN");

    return NextResponse.json({
      success: true,
      total: users.length,
      counts: {
        sellers: sellers.length,
        buyers: buyers.length,
        admins: admins.length,
      },
      data: {
        sellers,
        buyers,
        admins,
        all: users,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al obtener usuarios de prueba";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
