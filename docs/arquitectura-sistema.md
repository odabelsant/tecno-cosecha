# Arquitectura del Sistema — Tecno Cosecha

**Autor:** Arquitecto de Software  
**Fase:** Fase 02 — Alcance y Arquitectura  
**Estado:** Propuesta técnica formal para aprobación  

---

## 1. Visión General de la Arquitectura
Tecno Cosecha se diseña como una aplicación web moderna, responsiva y optimizada para dispositivos móviles (*mobile-first*), implementada como un **Monolito Modular en TypeScript**.

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE CLIENTE                        │
│   Next.js PWA / Web App Móvil (HTML5 semántico + CSS accesible) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST
┌──────────────────────────────▼──────────────────────────────┐
│                    CAPA DE APLICACIÓN Y API                 │
│        Controladores, Validadores de Esquema (Zod), Middleware│
└──────────────────────────────┬──────────────────────────────┘
                               │ Interfaces TypeScript
┌──────────────────────────────▼──────────────────────────────┐
│                    MÓDULOS DE DOMINIO                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Identity   │  │   Catalog    │  │  Orders & Claims │   │
│  │ (Auth/Roles) │  │(Cosechas/Lot)│  │(Transaccional)   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
┌─────────▼─────────────────▼───────────────────▼─────────────┐
│                    CAPA DE PERSISTENCIA                     │
│           ORM / Query Builder Tipado (Drizzle / Prisma)     │
│                 Base de Datos SQL Relacional                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Definición de Entidades de Dominio (Diseño Conceptual)

### 1. Dominio de Identidad (`modules/identity`)
* **`User`:** Identificador único, email/teléfono, contraseña hasheada, rol principal (`FARMER`, `BUYER_INDIVIDUAL`, `BUYER_BUSINESS`, `ADMIN`), estado (`ACTIVE`, `SUSPENDED`).
* **`FarmerProfile`:** ID de usuario, nombre de finca/cooperativa, provincia/municipio, sector, teléfono de contacto directo, descripción de producción.
* **`BuyerProfile`:** ID de usuario, tipo (`CONSUMER` | `BUSINESS`), razón social / RNC (opcional para B2B), dirección de recepción habitual.

### 2. Dominio de Catálogo (`modules/catalog`)
* **`Category`:** ID, nombre (`Tubérculos`, `Hortalizas`, `Frutas`, `Granos`), slug, icono/imagen.
* **`Publication`:** ID, ID del productor (`FarmerProfile`), categoría, título, variedad, descripción, unidad de medida (`LB`, `QQ`, `CIEN`, `SACO`, `CAJA`, `KG`), stock disponible, cantidad mínima de compra, precio unitario en RD$, fecha de cosecha/disponibilidad, estado (`PREVENTA`, `DISPONIBLE`, `AGOTADO`), foto URL.

### 3. Dominio Transaccional y Pedidos (`modules/orders`)
* **`Order`:** ID, número correlativo de pedido, ID del comprador, ID del vendedor, total en RD$, estado del pedido (`SOLICITADO`, `ACEPTADO`, `EN_PREPARACION`, `ENTREGADO`, `CANCELADO`), modalidad de entrega (`RETIRO_FINCA`, `PUNTO_ACOPIO`, `DELIVERY_ACORDADO`), notas de entrega.
* **`OrderItem`:** ID, ID del pedido, ID de la publicación original, cantidad solicitada, precio unitario congelado al momento del pedido, subtotal.

### 4. Dominio de Incidencias (`modules/claims`)
* **`Incident`:** ID, ID del pedido asociado, reportado por (`BUYER` | `FARMER`), motivo (`CALIDAD_DEFICIENTE`, `DIFERENCIA_PESO`, `NO_PRESENTACION`), descripción, evidencia fotográfica URL, estado de resolución (`ABIERTO`, `EN_MEDIACION`, `RESUELTO`, `RECHAZADO`), notas del administrador mediador.

---

## 3. Matriz de Permisos por Rol

| Acción / Recurso | Productor (Vendedor) | Comprador Consumidor | Comprador B2B | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| **Registrar/Editar su perfil** | Propietario | Propietario | Propietario | Todos |
| **Crear/Editar publicaciones** | Propietario | ❌ | ❌ | Moderación |
| **Explorar catálogo y precios** | Lectura | Lectura | Lectura (Precios B2B) | Lectura total |
| **Crear pedidos / Solicitudes** | ❌ | Sí (Minorista) | Sí (Mayorista) | ❌ |
| **Aceptar/Rechazar pedidos** | Propietario | ❌ | ❌ | Mediación |
| **Confirmar entrega/recepción** | Sí | Sí | Sí | Auditoría |
| **Reportar incidencia** | Sí | Sí | Sí | Mediación |
| **Resolver / Cerrar incidencia** | ❌ | ❌ | ❌ | **Exclusivo** |

---

## 4. Riesgos Legales y Operativos que Requieren Revisión Humana
1. **Responsabilidad sobre Calidad de Alimentos:** La plataforma es un punto de encuentro digital; los términos de uso deben explicitar que la inspección física final la realiza el comprador al momento de la entrega antes de pagar.
2. **Normativa Fiscal (DGII):** Las transacciones comerciales B2B requerirán eventualmente emisión de NCF (Comprobantes Fiscales). En el MVP, los productores y comercios son los únicos responsables de su facturación fiscal.
3. **Manejo de Reclamos y Devoluciones:** Dado que los productos agrícolas son perecederos, se establece una ventana estricta de 24 horas para levantar cualquier incidencia.

---

## 5. Decisiones Técnicas Clave y Dudas a Confirmar con el Usuario Humano

### Decisiones Asumidas (ADRs):
* **Stack:** Fullstack TypeScript con Node.js v24.
* **Lógica:** Arquitectura modular por dominios.
* **Persistencia:** Base de datos relacional con migraciones auditadas.
* **Pagos:** Directos contra entrega / transferencia en el MVP (sin pasarelas ni escrow en esta fase).

### Dudas para Decisión del Usuario Humano:
1. **Motor ORM preferido:** ¿Prefieres **Drizzle ORM** (más ligero, SQL-like y eficiente) o **Prisma** (más común en prototipos pero con binarios de motor más pesados)? *Recomendación técnica del equipo: Drizzle ORM.*
2. **Base de Datos para Desarrollo Local:** ¿Deseas iniciar con **SQLite** para cero fricción de instalación local en el MVP, o levantar un contenedor Docker con **PostgreSQL** desde el día uno? *Recomendación técnica: SQLite en desarrollo local con esquemas compatibles con PostgreSQL.*
