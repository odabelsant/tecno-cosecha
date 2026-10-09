# Plantilla de Entrega por Fase / Tarea

Esta plantilla debe ser utilizada por cada especialista y consolidada por el Orquestador al completar una tarea o fase de trabajo en Tecno Cosecha.

---

```markdown
# ENTREGA: [FASE XX / NOMBRE DE LA TAREA]

## 1. Qué se hizo
[Descripción concisa y concreta de las acciones realizadas, vinculadas a los requerimientos del PO]

## 2. Archivos Creados o Modificados
- `ruta/al/archivo1.ext`: [Motivo del cambio]
- `ruta/al/archivo2.ext`: [Motivo del cambio]

## 3. Pruebas Ejecutadas y Resultados Reales
*(Prohibido reportar pruebas no ejecutadas)*
- **Comando ejecutado:** `[comando exacto ejecutado en terminal]`
- **Resultado / Código de salida:** `[Salida real / exit code 0/1]`
- **Evidencia resumida:** `[Extracto representativo del log de consola]`

## 4. Problemas Pendientes, Defectos y Riesgos
- [ ] [Detalle del problema, pasos de reproducción y nivel de severidad. Si no hay, declarar "Ninguno identificado"].

## 5. Cómo Verificar Manualmente el Resultado
1. [Paso 1 exacto]
2. [Paso 2 exacto]
3. [Resultado visible esperado]

---

## 6. Documentación Pedagógica (Profesor Agent)
- [x] Actualizado `docs/estado-software.md`
- [x] Actualizado `docs/estado-software.html`
*(Ambos reflejan: Antes, Cambio, Después, Efecto para el usuario, Sin cambios, Limitaciones, Cómo verificarlo)*

---

## 7. Dictamen del Juez de Calidad
- **Veredicto:** [ ACEPTADO | RECHAZADO | BLOQUEADO ]
- **Evaluación crítica:** [Justificación del veredicto, cuestionamiento a QA y acciones requeridas]
```
