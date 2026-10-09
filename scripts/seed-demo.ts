import { getDatabase } from "../src/db/connection";
import { runMigrations, runSeeds, runDemoSeeds } from "../src/db/migrator";

export function seedDemoData() {
  const db = getDatabase();
  console.log("🌱 Iniciando inyección de datos de prueba para Tecno Cosecha...");

  // 1. Asegurar migraciones
  const appliedMigrations = runMigrations(db);
  console.log(`📦 Migraciones verificadas (${appliedMigrations.length} nuevas aplicadas).`);

  // 2. Aplicar semillas base y demo
  const appliedSeeds = runSeeds(db);
  const appliedDemoSeeds = runDemoSeeds(db);
  console.log(`🌾 Semillas base aplicadas:`, appliedSeeds);
  console.log(`🌾 Semillas demo aplicadas:`, appliedDemoSeeds);

  // 3. Conteo de verificación
  const farmersCount = (
    db.prepare("SELECT COUNT(*) as count FROM farmer_profiles").get() as { count: number }
  ).count;

  const buyersCount = (
    db.prepare("SELECT COUNT(*) as count FROM buyer_profiles").get() as { count: number }
  ).count;

  const ofertasCount = (
    db.prepare("SELECT COUNT(*) as count FROM marketplace_posts WHERE status = 'ACTIVA' AND post_type = 'OFERTA'").get() as { count: number }
  ).count;

  const demandasCount = (
    db.prepare("SELECT COUNT(*) as count FROM marketplace_posts WHERE status = 'ACTIVA' AND post_type = 'DEMANDA'").get() as { count: number }
  ).count;

  const totalPostsCount = (
    db.prepare("SELECT COUNT(*) as count FROM marketplace_posts WHERE status = 'ACTIVA'").get() as { count: number }
  ).count;

  console.log("✅ Inyección completada exitosamente:");
  console.log(`   👨‍🌾 Vendedores / Fincas registradas: ${farmersCount}`);
  console.log(`   🛒 Compradores / Comercios registrados: ${buyersCount}`);
  console.log(`   🛒 Ofertas de Venta activas (vista Comprar): ${ofertasCount}`);
  console.log(`   📢 Demandas de Compra activas (vista Vender): ${demandasCount}`);
  console.log(`   📦 Total publicaciones activas (vista General): ${totalPostsCount}`);

  return { farmersCount, buyersCount, ofertasCount, demandasCount, totalPostsCount };
}

if (require.main === module || process.argv[1]?.endsWith("seed-demo.ts")) {
  seedDemoData();
}
