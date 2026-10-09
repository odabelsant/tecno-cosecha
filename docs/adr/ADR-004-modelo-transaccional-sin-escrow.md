# ADR-004: Modelo Transaccional MVP y Desacoplamiento de Pagos/Escrow

## Estado
**Aceptado (Propuesta de Fase 02)**

## Contexto
Integrar pasarelas de pago con retención en garantía (*escrow*), pasarelas bancarias y contratos de transporte tercerizado en la primera fase del MVP añadiría una carga regulatoria, legal y técnica exorbitante (normativas de intermediación financiera, comisiones bancarias, riesgos de contracargo) que retrasaría la validación del producto en el campo.

## Decisión
1. Para el MVP, el modelo transaccional se basa en **Acuerdo Directo y Pago Contra Entrega / Transferencia Coordinada**:
   * La plataforma gestiona la oferta, la cotización, la reserva de stock y el compromiso formal de entrega.
   * La liquidación económica ocurre de forma directa entre comprador y productor en el momento de la entrega o vía transferencia bancaria previa acordada.
2. No se retendrán fondos de usuarios ni se implementará billetera virtual interna en el MVP.
3. Se excluye el rol de transportista independiente como agente transaccional en la plataforma: la logística de entrega se acuerda entre las dos partes (retiro en finca, punto de acopio o flete asumido).

## Consecuencias
* **Positivas:**
  * Cero fricción legal/financiera para el lanzamiento rápido del MVP.
  * Mayor confianza para los productores locales que prefieren el cobro inmediato al recibir su mercancía.
  * Arquitectura técnica mucho más simple y segura de auditar.
* **Negativas / Mitigaciones:**
  * Tecno Cosecha no puede retener comisiones automáticas directamente de los fondos en esta fase; los modelos de monetización en el MVP se gestionarán por planes o registro hasta que se habilite una pasarela formal autorizada en fases futuras.
