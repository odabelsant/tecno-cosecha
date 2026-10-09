# Especificación del Alcance del MVP — Tecno Cosecha

**Autor:** Product Owner  
**Fase:** Fase 02 — Alcance y Arquitectura  
**Estado:** Propuesta formal para revisión y aprobación  

---

## 1. Visión y Propósito del MVP
El MVP de **Tecno Cosecha** es un marketplace digital agrícola orientado a dispositivos móviles (*mobile-first*) que conecta de manera directa y transparente a **productores agrícolas (vendedores)** con **compradores comerciales (colmados, restaurantes, mayoristas) y consumidores finales**. El objetivo es reducir intermediarios innecesarios, transparentar precios de cosecha y facilitar la comercialización de productos del campo.

---

## 2. Tipos de Usuarios y Roles

1. **Vendedor / Productor Agrícola:**
   * Agricultores individuales, asociaciones campesinas o dueños de fincas.
   * Capacidades: Registro con datos de finca y ubicación, publicación de cosechas disponibles o por recolectar, fijación de precios y cantidades, aceptación o rechazo de solicitudes de compra, confirmación de despacho/entrega.
2. **Comprador Comercial (B2B):**
   * Negocios de alimentos, restaurantes, hoteles, supermercados locales y colmados.
   * Capacidades: Registro con nombre comercial/RNC opcional, visualización de precios y volúmenes mayoristas, solicitud de cotización/pedido formal, registro de recepción y reporte de incidencias.
3. **Comprador Consumidor (B2C):**
   * Hogares y compradores individuales.
   * Capacidades: Exploración de catálogo minorista, creación de pedidos directos simples, seguimiento de entrega y calificación/incidencia.
4. **Administrador de Plataforma (Interno):**
   * Equipo operativo de Tecno Cosecha.
   * Capacidades: Moderación de publicaciones, visualización de métricas de pedidos, mediación manual de incidencias y gestión de usuarios.

---

## 3. Categorías Agrícolas Iniciales
Para enfocar el MVP en productos de alta demanda y rotación en el mercado dominicano:
* **Tubérculos y Raíces:** Plátano (verde, maduro), Yuca, Batata, Ñame, Yautía.
* **Hortalizas y Vegetales:** Tomate (barceló, bugalú), Cebolla (roja, blanca), Ají (gustoso, morrón, cubanela), Lechuga, Zanahoria.
* **Frutas Tropicales:** Aguacate, Mango, Limón agrio, Piña, Chinola, Lechosa.
* **Granos y Legumbres:** Habichuelas (negras, rojas), Guandules, Maíz dulce.

---

## 4. Campos de la Publicación de Cosecha
Cada publicación registrada por un productor contendrá obligatoriamente:
* **Título del Producto:** Nombre comercial reconocible.
* **Categoría y Variedad:** Clasificación agrícola (ej. Tomate -> Barceló).
* **Ubicación de la Cosecha / Finca:** Municipio/Provincia y sector de procedencia.
* **Unidad de Medida:** Sistema estándar del agro dominicano (ver sección 5).
* **Cantidad Disponible (Stock):** Volumen ofertado en la unidad especificada.
* **Cantidad Mínima de Compra:** Umbral mínimo para compras mayoristas o pedidos base.
* **Precio Unitario (RD$):** Precio base en pesos dominicanos por unidad de medida.
* **Fecha de Disponibilidad / Cosecha:** Fecha en que el producto está listo para recolección o retiro.
* **Estado de la Cosecha:** `En producción / Preventa` | `Cosechado / Listo para entrega` | `Agotado`.
* **Fotografía / Evidencia visual:** Imagen real del lote agrícola.
* **Condiciones de Entrega:** Retiro en finca / Punto de acopio acordado / Entrega a acordar.

---

## 5. Unidades de Medida Agrícolas Oficiales
* **Libra (lb):** Unidad estándar de venta minorista y hortalizas de mesa.
* **Quintal (qq = 100 lb):** Unidad estándar mayorista para granos, tubérculos y cebolla.
* **Cien / Ciento (100 unidades):** Unidad tradicional para plátanos, guineos y cítricos.
* **Saco / Malla:** Presentaciones de acopio (especificando peso estimado en libras).
* **Caja / Huacal:** Presentaciones para frutas delicadas (mangos, aguacates, tomates).
* **Kilogramo (kg):** Soportado como referencia métrica internacional para compras técnicas.

---

## 6. Flujo Transaccional del MVP
El flujo se mantiene simple y confiable, sin pasarelas de pago automatizadas en el corte inicial:

```
[1. Cotización / Solicitud]
Comprador selecciona producto, cantidad y modalidad de entrega
               │
               ▼
[2. Revisión del Productor]
Productor recibe notificación de solicitud y confirma disponibilidad y precio
               │
               ▼
[3. Pedido Confirmado / Acuerdo]
Ambas partes acuerdan punto de entrega/retiro y forma de pago directo
               │
               ▼
[4. Entrega y Recepción]
El comprador inspecciona el producto en persona y confirma recepción
               │
               ▼
[5. Cierre o Incidencia]
Recepción conforme -> Pedido Completado
Diferencia en calidad/peso -> Registro de Incidencia para mediación humana
```

---

## 7. Manejo de Incidencias
* **Motivos admitidos en el MVP:**
  1. Calidad deficiente o producto descompuesto.
  2. Diferencia de peso o faltante de unidades.
  3. No presentación del vendedor o del comprador en el punto de encuentro.
* **Resolución en MVP:** Registro formal de reclamo con evidencia fotográfica. El administrador de Tecno Cosecha revisa el caso y media el acuerdo entre partes.

---

## 8. Límites Explícitos: Qué queda FUERA del MVP
Para proteger la fecha de lanzamiento y la simplicidad técnica, **queda formalmente excluido**:
1. ❌ **IA predictiva:** No habrá pronóstico de precios algorítmicos ni machine learning de rendimiento de cultivos.
2. ❌ **App nativa pura (iOS/Android):** El producto será una Progressive Web App (PWA) / Web App responsive orientada al navegador móvil.
3. ❌ **Rol de Transportista Independiente:** No se implementará un marketplace de conductores estilo Uber Freight; la logística se resuelve por acuerdo directo entre las dos partes (retiro en finca o entrega acordada).
4. ❌ **Pasarelas de Pago y Escrow:** No se retendrá dinero en fideicomiso ni se procesarán tarjetas de crédito; el pago es directo contra entrega (efectivo o transferencia bancaria coordinada).
5. ❌ **Multas y penalizaciones financieras automáticas:** Las disputas no generarán débitos bancarios automáticos; se gestionarán mediante reputación y suspensión de cuenta si hay reincidencia.

---

## 9. Riesgos Legales y Operativos que Requieren Supervisión Humana
* **Inocuidad y Perecibilidad:** Los alimentos se degradan rápidamente; los reclamos deben notificarse en un plazo máximo de 24 horas tras la entrega.
* **Comprobantes Fiscales:** La plataforma solo actúa como facilitador de contacto comercial en el MVP; cada productor/negocio emite sus propios comprobantes fiscales según la normativa tributaria local (DGII).
* **Seguridad en Puntos de Entrega:** Recomendación operativa de realizar entregas en puntos públicos de acopio o fincas reconocidas.
