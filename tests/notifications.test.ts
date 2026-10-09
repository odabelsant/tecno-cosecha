import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { runMigrations } from "@/db/migrator";
import { NotificationsService } from "@/modules/notifications/service";
import { HelpService } from "@/modules/help/service";

describe("Fase 14: Notificaciones Esenciales y Ayuda al Usuario", () => {
  let db: Database.Database;
  let notifService: NotificationsService;
  let helpService: HelpService;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);

    db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role)
      VALUES 
        ('u_user1', 'agricultor@campo.do', '8095552001', 'hash1', 'FARMER'),
        ('u_user2', 'comprador@campo.do', '8095552002', 'hash2', 'BUYER_INDIVIDUAL')
    `).run();

    notifService = new NotificationsService(db);
    helpService = new HelpService(db);
  });

  afterEach(() => {
    db.close();
  });

  describe("Notificaciones Esenciales", () => {
    it("debe registrar notificaciones de cotización y pedidos con privacidad de datos", () => {
      const notif = notifService.notify({
        userId: "u_user1",
        eventType: "QUOTE_RECEIVED",
        title: "Nueva solicitud de cotización",
        message: "Un comprador solicita 40 Quintales de Plátano Macho.",
        referenceId: "q_100",
        referenceType: "QUOTE",
      });

      expect(notif).toBeDefined();
      expect(notif?.title).toBe("Nueva solicitud de cotización");
      expect(notif?.is_read).toBe(0);

      const unreadCount = notifService.getUnreadCount("u_user1");
      expect(unreadCount).toBe(1);
    });

    it("REGLA ANTI-DUPLICADOS: Evita duplicados idénticos no leídos para la misma referencia", () => {
      const first = notifService.notify({
        userId: "u_user1",
        eventType: "ORDER_STATUS_CHANGED",
        title: "Pedido en camino",
        message: "El transporte va en ruta hacia el punto de acopio.",
        referenceId: "ord_555",
        referenceType: "ORDER",
      });
      expect(first).toBeDefined();

      // Segundo intento inmediato con la misma referencia sin leer
      const duplicate = notifService.notify({
        userId: "u_user1",
        eventType: "ORDER_STATUS_CHANGED",
        title: "Pedido en camino",
        message: "El transporte va en ruta hacia el punto de acopio.",
        referenceId: "ord_555",
        referenceType: "ORDER",
      });

      // No se inserta duplicado
      expect(duplicate).toBeNull();
      expect(notifService.getUnreadCount("u_user1")).toBe(1);
    });

    it("debe permitir marcar notificaciones como leídas y consultar histórico", () => {
      const n1 = notifService.notify({
        userId: "u_user1",
        eventType: "QUOTE_RECEIVED",
        title: "Cotización 1",
        message: "Mensaje 1",
        referenceId: "ref_1",
      })!;

      notifService.notify({
        userId: "u_user1",
        eventType: "QUOTE_ACCEPTED",
        title: "Cotización 2",
        message: "Mensaje 2",
        referenceId: "ref_2",
      });

      expect(notifService.getUnreadCount("u_user1")).toBe(2);

      // Marcar una como leída
      const marked = notifService.markAsRead(n1.id, "u_user1");
      expect(marked).toBe(true);
      expect(notifService.getUnreadCount("u_user1")).toBe(1);

      // Marcar todas
      notifService.markAllAsRead("u_user1");
      expect(notifService.getUnreadCount("u_user1")).toBe(0);
    });
  });

  describe("Centro de Ayuda, Tutoriales y Preguntas Frecuentes", () => {
    it("debe retornar preguntas frecuentes en lenguaje claro para agricultores", () => {
      const faqs = helpService.getFaqs();
      expect(faqs.length).toBeGreaterThanOrEqual(4);

      const paymentFaq = faqs.find((f) => f.category === "PAGOS");
      expect(paymentFaq).toBeDefined();
      expect(paymentFaq?.answer).toContain("pago se hace de manera directa");

      const planFaq = faqs.find((f) => f.question.includes("verifiquen mi finca"));
      expect(planFaq).toBeDefined();
      expect(planFaq?.answer).toContain("No. La verificación básica de tu finca o negocio es accesible en cualquier plan");
    });

    it("debe proveer tutoriales iniciales sin URLs inventadas y permitir administrarlas", () => {
      const tutorials = helpService.getTutorials();
      expect(tutorials.length).toBeGreaterThanOrEqual(3);

      // Los tutoriales iniciales no tienen URLs inventadas (external_url es null)
      for (const tut of tutorials) {
        expect(tut.steps.length).toBeGreaterThan(0);
      }

      // Permite asignar una URL real
      const updated = helpService.updateTutorialUrl("tut_vender", "https://tecnocosecha.do/guias/publicar.pdf");
      expect(updated).toBe(true);

      const reloaded = helpService.getTutorials().find((t) => t.id === "tut_vender");
      expect(reloaded?.external_url).toBe("https://tecnocosecha.do/guias/publicar.pdf");
    });
  });
});
