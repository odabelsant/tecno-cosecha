# Plan de Lanzamiento Piloto y Operaciones — Tecno Cosecha

**Fase:** Fase 16 — Validación Final y Piloto  
**Fecha:** 2026-10-09  
**Estado:** Propuesta formal para aprobación humana  

---

## 1. Alcance y Territorio del Piloto
El piloto se concentrará en el **Cibao Central (La Vega, Espaillat/Moca y Jarabacoa/Constanza)** para validar la interacción directa entre productores agrícolas y compradores comerciales:

* **Productores participantes:** 15 parceleros y cooperativas familiares con cosechas de ciclo corto (Plátano Macho, Yuca Mocana, Batata, Tomate Barceló, Cebolla Roja).
* **Compradores participantes:** 10 negocios locales (restaurantes, colmados y distribuidores minoristas de La Vega y Santiago).
* **Duración estimada:** 4 semanas de operación real supervisada.

---

## 2. Objetivos y Criterios de Éxito del Piloto

| Métrica / Indicador | Meta del Piloto | Método de Verificación |
| :--- | :---: | :--- |
| **Publicaciones activas** | $\ge 25$ lotes agrícolas | Conteo en `marketplace_posts` |
| **Cotizaciones completadas** | $\ge 30$ negociaciones bilaterales | Estados en `quotes` |
| **Tasa de pedidos entregados** | $\ge 80\%$ de pedidos formalizados | Estados en `orders` con `ENTREGADO` |
| **Tiempo de respuesta a incidencias** | $< 12$ horas | Registro de mediación en `admin_audit_logs` |
| **Satisfacción de usuarios** | $\ge 4.2 / 5.0$ estrellas | Promedio en tabla `reviews` |

---

## 3. Matriz de Riesgos Aceptados y Mitigaciones

| Riesgo Operativo | Nivel de Riesgo | Mitigación Implementada |
| :--- | :---: | :--- |
| **Baja alfabetización digital en el campo** | Medio | Centro de ayuda contextual con guías paso a paso, vocabulario sin jerga técnica y soporte presencial/telefónico del equipo regional. |
| **Diferencias de peso o merma en transporte** | Alto | Soporte formal de **Recepción Parcial** (`received_quantity`) en la confirmación de entrega sin anular el pedido original. |
| **Cancelaciones tardías o no presentación** | Medio | Máquina de estados estricta; prohibición de cancelar pedidos una vez están `EN_CAMINO`; penalización en reputación y mediación administrativa obligatoria. |
| **Disputas comerciales sin escrow bancario** | Controlado | Modelo conforme a ADR-004: liquidación directa en efectivo o transferencia en la entrega física tras inspección ocular. |

---

## 4. Instrucciones Reproducibles de Operación y Despliegue

### Requisitos Previos:
* Node.js v20+ o v24+
* npm v10+

### Pasos de Instalación y Ejecución Local:
```bash
# 1. Clonar el repositorio y entrar al directorio
cd "Tecno Cosecha"

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Ejecutar las 6 migraciones relacionales
# (Las migraciones se aplican automáticamente en la primera conexión de base de datos)

# 5. Ejecutar suite de pruebas de regresión (64 pruebas)
npm test

# 6. Compilación de producción
npm run build

# 7. Iniciar servidor de desarrollo local
npm run dev
```

---

## 5. Rutas Operativas Principales

* **Portal Principal:** `http://localhost:3000/`
* **Catálogo y Búsqueda:** `http://localhost:3000/catalogo`
* **Publicación de Cosechas:** `http://localhost:3000/publicar`
* **Gestión de Pedidos y Cotizaciones:** `http://localhost:3000/pedidos`
* **Planes y Verificación Gratuita:** `http://localhost:3000/planes`
* **Centro de Ayuda y Tutoriales:** `http://localhost:3000/ayuda`
* **Panel Administrativo y Auditoría:** `http://localhost:3000/admin`
