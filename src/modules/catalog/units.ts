/**
 * Módulo de Unidades Agrícolas y Conversión Explícita (Fase 07)
 * Regla técnica: Prohibido comparar precios o cantidades entre unidades incompatibles
 * sin una conversión explícita justificada.
 */

export type AgriculturalUnit = "LB" | "QQ" | "CIEN" | "SACO" | "CAJA" | "KG" | "UNIDAD";

export interface UnitDefinition {
  code: AgriculturalUnit;
  name: string;
  category: "peso" | "conteo" | "empaque";
  description: string;
  weightInPounds?: number; // Equivalencia exacta en libras cuando aplica
}

export const AGRICULTURAL_UNITS: Record<AgriculturalUnit, UnitDefinition> = {
  LB: {
    code: "LB",
    name: "Libra",
    category: "peso",
    description: "Unidad base minorista (16 onzas)",
    weightInPounds: 1,
  },
  QQ: {
    code: "QQ",
    name: "Quintal",
    category: "peso",
    description: "Unidad estándar mayorista del agro dominicano (100 libras)",
    weightInPounds: 100,
  },
  KG: {
    code: "KG",
    name: "Kilogramo",
    category: "peso",
    description: "Sistema métrico (2.20462 libras)",
    weightInPounds: 2.20462,
  },
  CIEN: {
    code: "CIEN",
    name: "Ciento (100 unidades)",
    category: "conteo",
    description: "Unidad tradicional para plátanos, cítricos y guineos",
  },
  UNIDAD: {
    code: "UNIDAD",
    name: "Unidad Individual",
    category: "conteo",
    description: "Venta por pieza o fruto",
  },
  SACO: {
    code: "SACO",
    name: "Saco / Malla",
    category: "empaque",
    description: "Presentación de acopio (peso variable según rubro)",
  },
  CAJA: {
    code: "CAJA",
    name: "Caja / Huacal",
    category: "empaque",
    description: "Presentación protegida para frutas y tomates",
  },
};

/**
 * Verifica si dos unidades son directamente convertibles entre sí.
 */
export function areUnitsCompatible(unitA: AgriculturalUnit, unitB: AgriculturalUnit): boolean {
  const defA = AGRICULTURAL_UNITS[unitA];
  const defB = AGRICULTURAL_UNITS[unitB];
  if (!defA || !defB) return false;

  // Unidades de peso con equivalencia matemática conocida
  if (defA.category === "peso" && defB.category === "peso") {
    return !!(defA.weightInPounds && defB.weightInPounds);
  }

  // Unidades de conteo puro
  if (defA.category === "conteo" && defB.category === "conteo") {
    return true;
  }

  // Empaques no son convertibles directamente sin especificar peso neto del lote
  return false;
}

/**
 * Convierte una cantidad de una unidad a otra compatible.
 * Retorna null si las unidades no son compatibles.
 */
export function convertQuantity(
  quantity: number,
  fromUnit: AgriculturalUnit,
  toUnit: AgriculturalUnit
): number | null {
  if (quantity < 0) return null;
  if (fromUnit === toUnit) return quantity;

  const fromDef = AGRICULTURAL_UNITS[fromUnit];
  const toDef = AGRICULTURAL_UNITS[toUnit];
  if (!fromDef || !toDef) return null;

  // Conversión entre unidades de peso
  if (fromDef.weightInPounds && toDef.weightInPounds) {
    const totalPounds = quantity * fromDef.weightInPounds;
    return totalPounds / toDef.weightInPounds;
  }

  // Conversión entre conteo (CIEN <-> UNIDAD)
  if (fromUnit === "CIEN" && toUnit === "UNIDAD") {
    return quantity * 100;
  }
  if (fromUnit === "UNIDAD" && toUnit === "CIEN") {
    return quantity / 100;
  }

  return null;
}

/**
 * Normaliza el precio a un precio estándar comparable (ej. precio por Libra o por Unidad).
 * Si la unidad no es convertible, retorna null para evitar comparaciones engañosas.
 */
export function normalizePriceForComparison(
  unitPrice: number,
  unit: AgriculturalUnit
): { normalizedPrice: number; normalizedUnit: "LB" | "UNIDAD" } | null {
  if (unitPrice <= 0) return null;

  const def = AGRICULTURAL_UNITS[unit];
  if (!def) return null;

  if (def.category === "peso" && def.weightInPounds) {
    // Normalizar a precio por LIBRA
    return {
      normalizedPrice: unitPrice / def.weightInPounds,
      normalizedUnit: "LB",
    };
  }

  if (unit === "CIEN") {
    // Normalizar a precio por UNIDAD
    return {
      normalizedPrice: unitPrice / 100,
      normalizedUnit: "UNIDAD",
    };
  }

  if (unit === "UNIDAD") {
    return {
      normalizedPrice: unitPrice,
      normalizedUnit: "UNIDAD",
    };
  }

  // Empaques (SACO, CAJA) no tienen precio unitario comparable sin peso declarado
  return null;
}
