# ADR-001: Selección del Stack Tecnológico Unificado en TypeScript

## Estado
**Aceptado (Propuesta de Fase 02)**

## Contexto
El diagnóstico de Fase 00 constató la presencia en el entorno local de **Node.js v24.4.1**, **npm 11.21.0** y **Git 2.50.1**, sin proyectos ni dependencias previas. Se requiere una plataforma de desarrollo ágil, tipada de extremo a extremo, compatible con desarrollo móvil (*mobile-first*), con alto soporte comunitario y que evite la fragmentación de lenguajes entre frontend y backend.

## Decisión
Adoptar un stack tecnológico unificado basado en **TypeScript / Node.js**:
1. **Frontend & Fullstack Web:** Next.js (App Router) con TypeScript y TailwindCSS o CSS Vanilla con tokens de diseño accesibles. Esto permite renderizado eficiente (SSR/SSG), soporte PWA y optimización móvil nativa.
2. **Backend & API:** Rutas de API tipadas con esquemas de validación estrictos en TypeScript (usando Zod para sanitización de entrada).
3. **Persistencia:** Base de datos SQL relacional (PostgreSQL en producción, SQLite/PostgreSQL en desarrollo local) gestionada con un ORM/Query Builder moderno y tipado (Drizzle ORM o Prisma).
4. **Testing:** Vitest para pruebas unitarias/integración por su compatibilidad nativa con TypeScript y velocidad de ejecución.

## Consecuencias
* **Positivas:**
  * Un solo lenguaje (TypeScript) en todas las capas del sistema.
  * Tipos compartidos entre contratos de API, formularios de frontend y modelos de datos.
  * Cero costo de cambio de contexto entre desarrolladores.
  * Despliegue sencillo y reproducible.
* **Negativas / Mitigaciones:**
  * Exige disciplina estricta de tipado (evitar `any`).
  * Requiere Node.js 20+ (cumplido: entorno cuenta con Node v24).
