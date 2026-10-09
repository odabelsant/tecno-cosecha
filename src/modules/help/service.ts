import Database from "better-sqlite3";
import crypto from "crypto";
import { getDatabase } from "@/db/connection";

export type HelpCategory = "COTIZACIONES" | "PEDIDOS" | "PUBLICACIONES" | "PAGOS" | "GENERAL";

export interface TutorialStep {
  stepNumber: number;
  instruction: string;
}

export interface TutorialRecord {
  id: string;
  category: HelpCategory;
  title: string;
  summary: string;
  steps_json: string;
  external_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TutorialParsed extends Omit<TutorialRecord, "steps_json"> {
  steps: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: HelpCategory;
}

export const CANONICAL_FAQS: FAQItem[] = [
  {
    id: "faq_1",
    category: "PUBLICACIONES",
    question: "¿Cómo publico mi cosecha para vender?",
    answer: "Entra a 'Publicar', escribe qué cosechas (ej. Plátano Macho o Yuca), cuántos sacos o quintales tienes y el precio por unidad. Tu oferta saldrá de inmediato para que colmados y mayoristas la vean.",
  },
  {
    id: "faq_2",
    category: "PAGOS",
    question: "¿Cómo y cuándo me pagan mi cosecha?",
    answer: "El pago se hace de manera directa entre tú y el comprador (en efectivo o transferencia acordada) al momento de la entrega e inspección física. Tecno Cosecha no te retiene dinero ni cobra comisiones ocultas.",
  },
  {
    id: "faq_3",
    category: "COTIZACIONES",
    question: "¿Qué pasa si un comprador me ofrece un precio distinto?",
    answer: "El comprador te enviará una contrapropuesta. Podrás ver el nuevo precio y cantidad en tus pedidos. Si te conviene, le das a 'Aceptar'; si no, puedes rechazarla o responder con otro precio. Nadie puede cambiar el precio a tus espaldas.",
  },
  {
    id: "faq_4",
    category: "PEDIDOS",
    question: "¿Qué hago si la carga llega con menos peso o con daño?",
    answer: "Al recibir el camión, anota la cantidad real recibida ('recepción parcial'). Si hay problema grave, abre un reclamo con foto y descripción antes de 24 horas para que el equipo de Tecno Cosecha medie el caso.",
  },
  {
    id: "faq_5",
    category: "GENERAL",
    question: "¿Tengo que pagar un plan para que verifiquen mi finca?",
    answer: "No. La verificación básica de tu finca o negocio es accesible en cualquier plan (incluso en el plan gratuito Explora). Solo debes presentar tus datos reales para dar confianza a los compradores.",
  },
];

export const INITIAL_TUTORIALS: Array<{
  id: string;
  category: HelpCategory;
  title: string;
  summary: string;
  steps: string[];
  external_url: string | null;
  display_order: number;
}> = [
  {
    id: "tut_vender",
    category: "PUBLICACIONES",
    title: "Guía Rápida: Cómo publicar una cosecha",
    summary: "Pasos simples para mostrar tu producto a compradores de todo el país.",
    steps: [
      "1. Presiona el botón verde 'Publicar' en el menú principal.",
      "2. Elige si estás 'Vendiendo cosecha' o 'Buscando comprar'.",
      "3. Selecciona tu rubro y la unidad de medida (ej. Quintal QQ o Libra LB).",
      "4. Pon el precio por unidad en pesos dominicanos (RD$).",
      "5. Guarda la publicación. ¡Listo! Ya estás visible.",
    ],
    external_url: null, // Sin URLs ficticias; administrable por el equipo
    display_order: 1,
  },
  {
    id: "tut_cotizar",
    category: "COTIZACIONES",
    title: "Guía Rápida: Cómo negociar una cotización",
    summary: "Aprende a acordar precios justos con protección total.",
    steps: [
      "1. Revisa la solicitud en tu sección de 'Pedidos'.",
      "2. Observa la cantidad, la fecha de corte y el precio propuesto.",
      "3. Si estás de acuerdo, presiona 'Aceptar Cotización'.",
      "4. Si quieres ajustar el precio, envía una 'Contrapropuesta'.",
      "5. Una vez aceptada por ambas partes, el precio queda congelado e inalterable.",
    ],
    external_url: null,
    display_order: 2,
  },
  {
    id: "tut_entrega",
    category: "PEDIDOS",
    title: "Guía Rápida: Despacho y entrega en el campo",
    summary: "Cómo confirmar que el camión salió y que la carga llegó bien.",
    steps: [
      "1. Cuando estés empacando, marca el pedido como 'En Preparación'.",
      "2. Al salir el transporte hacia el punto de encuentro, cámbialo a 'En Camino'.",
      "3. El comprador inspecciona el producto en persona y confirma 'Entregado'.",
      "4. Se realiza el pago directo acordado mano a mano.",
    ],
    external_url: null,
    display_order: 3,
  },
];

export class HelpService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
    this.seedDefaultTutorialsIfEmpty();
  }

  private seedDefaultTutorialsIfEmpty(): void {
    const count = (
      this.db.prepare("SELECT COUNT(*) as count FROM help_tutorials").get() as { count: number }
    )?.count;

    if (count === 0) {
      const insert = this.db.prepare(`
        INSERT INTO help_tutorials (id, category, title, summary, steps_json, external_url, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const tut of INITIAL_TUTORIALS) {
        insert.run(
          tut.id,
          tut.category,
          tut.title,
          tut.summary,
          JSON.stringify(tut.steps),
          tut.external_url,
          tut.display_order
        );
      }
    }
  }

  /**
   * Obtiene la lista de tutoriales filtrados opcionalmente por categoría.
   */
  public getTutorials(category?: HelpCategory): TutorialParsed[] {
    let rows: TutorialRecord[];
    if (category) {
      rows = this.db
        .prepare(`
          SELECT * FROM help_tutorials
          WHERE category = ?
          ORDER BY display_order ASC, title ASC
        `)
        .all(category) as TutorialRecord[];
    } else {
      rows = this.db
        .prepare(`
          SELECT * FROM help_tutorials
          ORDER BY display_order ASC, title ASC
        `)
        .all() as TutorialRecord[];
    }

    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      summary: r.summary,
      steps: JSON.parse(r.steps_json || "[]"),
      external_url: r.external_url,
      display_order: r.display_order,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  /**
   * Retorna las preguntas frecuentes en lenguaje claro.
   */
  public getFaqs(category?: HelpCategory): FAQItem[] {
    if (category) {
      return CANONICAL_FAQS.filter((f) => f.category === category);
    }
    return CANONICAL_FAQS;
  }

  /**
   * Permite administrar una URL real a un tutorial existente (sin enlaces ficticios de YouTube).
   */
  public updateTutorialUrl(tutorialId: string, url: string | null): boolean {
    const res = this.db
      .prepare(`
        UPDATE help_tutorials
        SET external_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(url ? url.trim() : null, tutorialId);

    return res.changes > 0;
  }

  /**
   * Crea o actualiza un tutorial.
   */
  public upsertTutorial(input: {
    id?: string;
    category: HelpCategory;
    title: string;
    summary: string;
    steps: string[];
    external_url?: string | null;
    display_order?: number;
  }): TutorialParsed {
    const id = input.id || "tut_" + crypto.randomUUID().slice(0, 8);
    const existing = this.db.prepare("SELECT id FROM help_tutorials WHERE id = ?").get(id);

    if (existing) {
      this.db
        .prepare(`
          UPDATE help_tutorials
          SET category = ?, title = ?, summary = ?, steps_json = ?, external_url = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .run(
          input.category,
          input.title,
          input.summary,
          JSON.stringify(input.steps),
          input.external_url || null,
          input.display_order ?? 0,
          id
        );
    } else {
      this.db
        .prepare(`
          INSERT INTO help_tutorials (id, category, title, summary, steps_json, external_url, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          id,
          input.category,
          input.title,
          input.summary,
          JSON.stringify(input.steps),
          input.external_url || null,
          input.display_order ?? 0
        );
    }

    const row = this.db.prepare("SELECT * FROM help_tutorials WHERE id = ?").get(id) as TutorialRecord;
    return {
      id: row.id,
      category: row.category,
      title: row.title,
      summary: row.summary,
      steps: JSON.parse(row.steps_json || "[]"),
      external_url: row.external_url,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
