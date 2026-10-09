# ADR-003: Persistencia Relacional y Migraciones Versionadas

## Estado
**Aceptado (Propuesta de Fase 02)**

## Contexto
El modelo de marketplace agrícola requiere alta integridad referencial: control estricto de existencias de cosecha, vinculación indiscutible entre compradores, productores y líneas de pedido, y auditoría de incidencias. Bases de datos no relacionales (NoSQL) introducirían riesgos de inconsistencia en el manejo de pedidos y stock.

## Decisión
1. Adoptar un modelo **SQL Relacional** estricto con restricciones de integridad de claves foráneas (`FOREIGN KEY`), checks y restricciones de unicidad.
2. Todo cambio de esquema se implementará mediante **migraciones DDL versionadas y reproducibles**, con scripts ascendentes (`up`) y de reversión (`down`).
3. Queda prohibida la ejecución de migraciones automáticas o destructivas en producción sin respaldo previo verificado.

## Consecuencias
* **Positivas:**
  * Garantía de transaccionalidad ACID para la reserva de cosechas y confirmación de pedidos.
  * Trazabilidad total de la evolución de la base de datos a lo largo de las fases.
* **Negativas / Mitigaciones:**
  * Las migraciones requieren planificación previa por parte del SQL Developer antes de que el Backend consuma nuevas tablas.
