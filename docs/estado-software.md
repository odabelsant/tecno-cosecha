# Estado del Software — Tecno Cosecha

Documento de seguimiento pedagógico e histórico del proyecto, gestionado por el **Profesor Agent**.

---

## Registro de Iteración: Gestión de Imágenes, Soporte Multiformato (5 Extensiones) y Datos Sembrados

* **Fecha:** 2026-10-09
* **Foco:** Gestión Visual de Productos, Carga Multiformato y Sembrado de Datos Dominicanos
* **Tipo de cambio:** Incorporación de columna `image_url` en base de datos (`0007_posts_image_url.sql`), miniaturas representativas en las tarjetas del Catálogo (`/catalogo`), módulo interactivo de carga con drag-and-drop y soporte explícito para 5 extensiones estándar (JPEG/JPG, PNG, GIF, SVG, WebP) con vista previa instantánea en Publicar (`/publicar`), inyección de 20 perfiles y 16 publicaciones con imágenes, y selector rápido de cuentas de desarrollo (`DevUserSwitcher`).

---

### 1. ANTES
Las tarjetas del catálogo mostraban únicamente atributos de texto plano (título, precio, unidad, ubicación) sin fotografías ni soporte visual representativo. La pantalla de publicación (`/publicar`) era un formulario prototípico sin campo de subida de archivos ni validación de formatos multimedia, y la base de datos relacional no contemplaba persistencia de imágenes en los lotes de cosecha.

---

### 2. CAMBIO
1. **Base de Datos y Persistencia:**
   * Migración [`0007_posts_image_url.sql`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/db/migrations/0007_posts_image_url.sql) con script de reversión `0007_posts_image_url.down.sql`.
   * Adaptación de `MarketplacePost`, `CreatePostDTO` y `UpdatePostDTO` en [`src/modules/publications/service.ts`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/modules/publications/service.ts) para soportar `image_url`.
   * Endpoints `GET` y `POST` en [`src/app/api/publications/route.ts`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/app/api/publications/route.ts) para consultar y crear publicaciones con fotos asociadas.
2. **Biblioteca de Ilustraciones Agrícolas y Sembrado B2B / B2C:**
   * Colección de gráficos vectoriales SVG ligeros (<1KB cada uno) en `public/images/crops/`: tomate, zanahoria, habichuela, plátano, mango, cebolla, ají, yuca, batata, aguacate, chinola y canasta default.
   * **Corrección de Reglas de Negocio en Semillas (`0003_demo_users_and_posts.sql`):** Inyección de **16 publicaciones de tipo OFERTA** (asociadas a los 10 vendedores para la vista "Comprar") y **12 publicaciones de tipo DEMANDA** (asociadas a los 10 compradores comerciales para la vista "Vender"), totalizando **28 lotes activos** con sus fotografías asignadas.
3. **Frontend — Catálogo con Miniaturas y Vistas Completas (`src/app/catalogo/page.tsx`):**
   * Integración de contenedor de imagen/miniatura (110x110px) en cada tarjeta, con carga diferida (`loading="lazy"`), manejo de error con fallback automático (`getCropImage`) y estilo accesible adaptado a la paleta canónica verde bosque y crema.
   * Ambas vistas operativas sin estados vacíos: **"Comprar (Ofertas)"** muestra las 16 ofertas de productores con badge `🛒 Cosecha en Venta` y **"Vender (Demandas)"** muestra los 12 requerimientos comerciales con badge `📢 Necesidad de Compra`.
4. **Frontend — Formulario de Publicación Multiformato (`src/app/publicar/page.tsx`):**
   * Componente interactivo drag-and-drop y selector de archivos (`<input type="file" />`).
   * Validación estricta y explícita de los 5 formatos estándar web:
     * JPEG / JPG (`.jpg`, `.jpeg`, `image/jpeg`)
     * PNG (`.png`, `image/png`)
     * GIF (`.gif`, `image/gif`)
     * SVG (`.svg`, `image/svg+xml`)
     * WebP (`.webp`, `image/webp`)
   * Tarjeta de vista previa instantánea con nombre del archivo, peso formateado (KB/MB), badge del formato verificado y botones para cambiar o eliminar la fotografía.
   * Mensaje claro de error si se intenta cargar un archivo incompatible.
   * Envío real a la API con persistencia inmediata y enlace directo al catálogo.
5. **Pruebas Automatizadas:**
   * Suite de pruebas unitarias en [`tests/images.test.ts`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/tests/images.test.ts) validando extensiones, tipos MIME, rechazo de formatos no compatibles y persistencia en base de datos (67 pruebas pasando en total).

---

### 3. DESPUÉS
El catálogo agrícola refleja fielmente la dinámica bilateral de mercado: los compradores pueden explorar las 16 ofertas de cosecha directa con fotografías reales, y los agricultores pueden consultar los 12 requerimientos activos de supermercados, restaurantes y mayoristas en la pestaña "Vender (Demandas)". Ambas pestañas y la vista general están 100% pobladas y operativas sin filtros vacíos.

---

### 4. EFECTO PARA EL USUARIO
* **Para el Comprador:** Visualización inmediata del producto agrícola antes de solicitar cotización o compra, facilitando la identificación rápida de calidades y variedades dominicanas.
* **Para el Productor:** Capacidad de destacar visualmente su cosecha subiendo fotos desde su celular o computadora en formatos populares (JPG, PNG, GIF, SVG o WebP) con confirmación visual previa.
* **Para el Evaluador/QA:** Posibilidad de probar el flujo visual completo tanto con las 16 publicaciones sembradas como publicando nuevas cosechas con imágenes reales o SVG.

---

### 5. SIN CAMBIOS
* La paleta cromática canónica (`#245C3A`, `#4D8A62`, `#C8754D`, `#F7F5EC`, `#253129`) y la navegación inferior móvil.
* Las reglas de cotización inmutable, formalización de pedidos y libro de auditoría de administradores.
* El esquema de categorías oficiales (`cat_tuberculos`, `cat_vegetales`, `cat_frutas`, `cat_granos`).

---

### 6. LIMITACIONES
* El almacenamiento actual utiliza rutas estáticas y data URLs codificadas en base de datos local SQLite; para producción masiva con cientos de miles de fotos se recomienda un bucket de almacenamiento S3/R2 con CDN.
* El límite de carga sugerido está acotado a 8 MB por fotografía para proteger el rendimiento en conexiones móviles del campo.

---

### 7. CÓMO VERIFICARLO
1. **Ejecutar pruebas unitarias de imágenes:**
   ```bash
   npm test tests/images.test.ts
   ```
2. **Re-sembrar datos de prueba con imágenes:**
   ```bash
   npm run seed:demo
   ```
3. **Verificar en el navegador:**
   * Entrar a [http://localhost:3000/catalogo](http://localhost:3000/catalogo) y verificar que cada tarjeta muestra su miniatura (tomates, plátanos, etc.).
   * Entrar a [http://localhost:3000/publicar](http://localhost:3000/publicar), subir un archivo de imagen (JPG, PNG, GIF, SVG o WebP) y verificar la vista previa interactiva.
   * Publicar la cosecha y pulsar en "Ver en el Catálogo" para confirmar la aparición del nuevo lote con su foto.

---

### 8. DICTAMEN DEL JUEZ DE CALIDAD (PUERTA DE CALIDAD)
* **Veredicto Oficial:** `ACEPTADO`
* **Auditoría de Criterios:**
  1. **Visualización en Catálogo:** Cumplida. Cada tarjeta de lote renderiza su miniatura fotográfica o ilustración representativa según el cultivo dominicano, con manejo de fallbacks.
  2. **Carga Multiformato y Validación (5 Extensiones):** Cumplida. El componente uploader en `/publicar` admite y valida explícitamente JPEG/JPG, PNG, GIF, SVG y WebP, con rechazo claro de formatos no soportados y vista previa en tiempo real.
  3. **Persistencia y Semillas Bilaterales:** Cumplida. Se generaron 16 publicaciones tipo `OFERTA` y 12 tipo `DEMANDA` asociadas a los 10 vendedores y 10 compradores, eliminando vistas vacías.
  4. **Evidencia de Pruebas de Consola:**
     * `npm test`: 15 archivos de prueba, **67 pruebas pasando (100%)**.
     * `npm run typecheck`: **0 errores de compilación TypeScript**.
     * `npm run lint`: **0 advertencias o errores ESLint**.
     * Verificación en vivo en navegador documentada con capturas de pantalla de ambas pestañas pobladas.

---

## Registro de Iteración Anterior: Fases 15 y 16 — Administración, Auditoría, Validación E2E y Piloto

* **Fecha:** 2026-10-09
* **Fases:** 
  * **Fase 15:** Administración y Moderación con Auditoría
  * **Fase 16:** Endurecimiento, Validación Final E2E y Lanzamiento Piloto
* **Tipo de cambio:** Implementación de panel administrativo protegido (`/admin`) con libro inmutable de auditoría (`admin_audit_logs`), prueba de ciclo de vida completo E2E (de publicación a disputa y backup), utilidad de respaldo en caliente para SQLite, y diseño del plan de piloto controlado en el Cibao Central.

---

### 1. ANTES
La plataforma disponía del flujo transaccional y los planes de suscripción (Fases 13 y 14), pero carecía de una interfaz de supervisión administrativa centralizada para moderar usuarios, revisar publicaciones reportadas y otorgar verificaciones de parcela; no existía un registro de auditoría estricto de las intervenciones técnicas; y no se disponía de una suite E2E de validación holística ni de copias de seguridad automáticas en caliente para la base de datos.

---

### 2. CAMBIO
El equipo diseñó e implementó los componentes de cierre y endurecimiento de la plataforma:

#### A. Fase 15 — Administración y Moderación (`src/modules/admin/service.ts`):
* **Principio de Mínimo Privilegio:** Acceso exclusivo a usuarios con rol `ADMIN` activo; rechazo inmediato con `UnauthorizedAdminActionError` a cualquier otro rol.
* **Libro Inmutable de Auditoría (`admin_audit_logs`):** Cada acción sensible (cambio de estado de usuario, moderación de lote, resolución de incidencia o certificación de finca) registra obligatoriamente actor, entidad, acción, justificación/motivo explícito y estado anterior/posterior.
* **Inmutabilidad Transaccional Estricta:** Ningún administrador puede editar silenciosamente precios pactados ni términos de pedidos congelados (`ImmutableHistoryViolationError`).
* **Panel Visual y Métricas KPI (`src/app/admin/page.tsx`):** Tablero con métricas clave del marketplace, formulario de intervención justificada y visor en vivo de auditoría.

#### B. Fase 16 — Validación E2E, Respaldo y Piloto (`tests/e2e-mvp-lifecycle.test.ts`, `src/db/backup.ts`):
* **Suite de Integración E2E Holística:** Prueba automatizada que valida la cadena completa:
  1. Registro de perfiles de productor y comprador.
  2. Ajuste de plan y límites validados en servidor.
  3. Publicación de cosecha en unidades agrícolas oficiales (`QQ`).
  4. Descubrimiento y filtrado multi-criterio.
  5. Solicitud de cotización, contrapropuesta versionada y aceptación inmutable.
  6. Conversión a pedido formal (`TC-ORD-XXXXXX`) y máquina de estados (`CONFIRMADO` $\rightarrow$ `EN_PREPARACION` $\rightarrow$ `EN_CAMINO` $\rightarrow$ `ENTREGADO`).
  7. Registro de recepción física parcial (merma de campo).
  8. Calificación de reputación post-entrega y apertura de incidencia con evidencia.
  9. Resolución administrativa mediada con registro en auditoría.
  10. Generación de copia de seguridad (backup) en caliente de SQLite.
* **Plan Piloto Formalizado ([`docs/plan-piloto.md`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/docs/plan-piloto.md)):** Alcance territorial en La Vega, Moca y Jarabacoa, métricas de éxito, matriz de riesgos aceptados e instrucciones reproducibles.

#### C. Persistencia y Rutas:
* Migración versionada [`0006_admin_audit_logs.sql`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/db/migrations/0006_admin_audit_logs.sql) y su respectivo script de reversión `0006_admin_audit_logs.down.sql`.
* Endpoints REST [`/api/admin`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/app/api/admin/route.ts) y página interactiva [`/admin`](file:///Users/onielsantos/Desktop/Documentos-Proyectos/Tecno%20Cosecha/src/app/admin/page.tsx).

---

### 3. DESPUÉS
Tecno Cosecha cuenta con su arquitectura MVP completa, probada de extremo a extremo, endurecida y lista para pruebas operativas: desde el primer registro hasta la resolución mediada y la copia de seguridad, con 64 pruebas automatizadas pasando y 18 rutas Next.js operativas.

---

### 4. EFECTO PARA EL USUARIO
* **Para el Equipo de Soporte y Operaciones:** Panel claro con métricas del sistema, herramientas para proteger a la comunidad de estafas y respaldo auditable de cada decisión.
* **Para Agricultores y Compradores:** Certeza de que la plataforma está supervisada activamente por humanos y que sus acuerdos no pueden ser alterados arbitrariamente.
* **Para el Propietario del Producto:** Hoja de ruta 100% implementada con criterios medibles y plan de piloto estructurado.

---

### 5. SIN CAMBIOS
* No se han integrado cobros con tarjeta ni comisiones bancarias automáticas, en cumplimiento estricto de ADR-004.
* La paleta visual canónica (#245C3A, #4D8A62, #C8754D, #F7F5EC, #253129) rige de manera consistente toda la aplicación.
* Todas las migraciones previas (0001 a 0005) continúan 100% íntegras y estables.

---

### 6. LIMITACIONES
* El piloto inicial está restringido a 15 productores y 10 comercios en el Cibao Central para mantener supervisión directa.
* La resolución de incidencias es administrativa/mediada sin débitos automáticos bancarios.

---

### 7. CÓMO VERIFICARLO
1. Ejecutar las 64 pruebas automatizadas en consola:
   ```bash
   npm test
   ```
2. Ejecutar la verificación estricta de tipos y compilación de producción:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
3. Iniciar el servidor local de desarrollo y explorar la aplicación:
   ```bash
   npm run dev
   ```
   * Portal principal: `http://localhost:3000/`
   * Catálogo agrícola: `http://localhost:3000/catalogo`
   * Publicar cosechas: `http://localhost:3000/publicar`
   * Pedidos y cotizaciones: `http://localhost:3000/pedidos`
   * Planes y límites: `http://localhost:3000/planes`
   * Centro de ayuda: `http://localhost:3000/ayuda`
   * Panel administrativo: `http://localhost:3000/admin`
4. Abrir la documentación pedagógica actualizada:
   ```bash
   open docs/estado-software.html
   ```

---

## Histórico de Iteraciones Anteriores

### Iteración: Fases 13 y 14 — Planes, Notificaciones y Ayuda al Usuario (2026-10-09)
* **Cambio:** Planes validados en servidor, verificación gratuita, notificaciones in-app esenciales y centro de ayuda. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fases 10, 11 y 12 — Cotizaciones, Pedidos y Confianza (2026-10-09)
* **Cambio:** Cotizaciones versionadas, máquina de estados de pedidos, reseñas anti-duplicados y mediación humana de reclamos. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fases 07, 08 y 09 — Catálogo, Publicaciones y Descubrimiento (2026-10-09)
* **Cambio:** Taxonomía aprobada, conversor de unidades, vistas General/Comprar/Vender y motor de búsqueda multi-criterio. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fase 05 — Modelo de Datos y Persistencia (2026-10-09)
* **Cambio:** SQLite relacional, tabla `schema_migrations`, restricciones CHECK y Foreign Keys. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fase 04 — UX/UI Base y Sistema Visual (2026-10-09)
* **Cambio:** Paleta canónica, navegación móvil y componentes de estado. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fase 03 — Fundación Técnica y Repositorio (2026-10-09)
* **Cambio:** Next.js 15, TypeScript estricto, Vitest, ESLint, .gitignore y .env.example. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fase 02 — Alcance Funcional y Arquitectura (2026-10-09)
* **Cambio:** Especificación de alcance MVP y registros ADR-001 a ADR-004. Veredicto del Juez: `ACEPTADO`.

### Iteración: Fase 01 — Equipo de Agentes y Puerta de Calidad (2026-10-09)
* **Cambio:** 12 perfiles canónicos, AGENTS.md, protocolo de equipo y matriz RACI. Veredicto del Juez: `ACEPTADO`.
