# ADR-002: Arquitectura Modular por Dominios y Límites de Responsabilidad

## Estado
**Aceptado (Propuesta de Fase 02)**

## Contexto
Tecno Cosecha debe comenzar como un MVP simple, pero su dominio agrícola posee reglas comerciales específicas (lotes, unidades de medida no tradicionales, transacciones B2B y B2C). Diseñar un monolito espagueti dificultaría el mantenimiento y la evolución del sistema.

## Decisión
Implementar un **Monolito Modular** desacoplado por contextos delimitados (*Bounded Contexts*), estructurado en módulos funcionales independientes dentro del mismo repositorio:
1. `modules/identity`: Gestión de usuarios, perfiles (Productor, Comprador Comercial, Comprador Consumidor) y roles.
2. `modules/catalog`: Publicaciones agrícolas, variedades, unidades de medida, stock de cosecha y precios.
3. `modules/orders`: Solicitudes de compra, máquina de estados de pedidos (Solicitado -> Aceptado -> En Camino -> Entregado -> Cancelado).
4. `modules/claims`: Registro y mediación de incidencias y discrepancias de entrega.

Cada módulo encapsula sus propios esquemas de datos, servicios de dominio y contratos, comunicándose entre sí a través de interfaces TypeScript explícitas.

## Consecuencias
* **Positivas:**
  * Facilidad de comprensión y desarrollo paralelo por distintos especialistas.
  * Si un módulo crece en complejidad futura (ej. catálogo o logística), puede evolucionar sin afectar al resto.
  * Pruebas aisladas por dominio con alta cohesión y bajo acoplamiento.
* **Negativas / Mitigaciones:**
  * Requiere disciplina para no realizar llamadas cruzadas directas sin usar la interfaz pública de cada módulo.
