# Matriz de Responsabilidades (RACI) — Tecno Cosecha

Esta matriz define los niveles de responsabilidad de cada agente en las distintas actividades del ciclo de vida del software.

### Leyenda RACI:
* **R (Responsible):** Quien realiza la actividad o genera el entregable.
* **A (Accountable):** Quien aprueba o responde en última instancia por el resultado.
* **C (Consulted):** Quien aporta información, conocimientos o validaciones previas.
* **I (Informed):** Quien es notificado del progreso o resultado final.

---

| Actividad / Hito | Orq | PO | Arq | UX | Front | Back | API | SQL | DevO | QA | Juez | Prof | Usuario |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Definir Alcance & Criterios Aceptación** | C | **R/A** | C | C | I | I | I | I | I | C | I | I | **A** |
| **Diseño Arquitectura & ADRs** | C | I | **R/A** | I | C | C | C | C | C | I | I | I | C |
| **Diseño UX/UI & Accesibilidad** | C | C | C | **R/A** | C | I | I | I | I | C | I | I | C |
| **Implementación Frontend** | C | I | C | C | **R/A** | I | C | I | I | C | I | I | I |
| **Lógica de Negocio Backend** | C | I | C | I | I | **R/A** | C | C | I | C | I | I | I |
| **Definición & Endpoints de API** | C | I | C | I | C | C | **R/A** | I | I | C | I | I | I |
| **Modelado SQL & Migraciones** | C | I | C | I | I | C | I | **R/A** | C | C | I | I | I |
| **CI/CD, Entornos & Configuración** | C | I | C | I | I | I | I | C | **R/A** | C | I | I | I |
| **Diseño & Ejecución de Pruebas** | C | C | I | I | C | C | C | C | C | **R/A** | C | I | I |
| **Documentación Pedagógica (MD/HTML)** | C | I | I | I | I | I | I | I | I | I | C | **R/A** | I |
| **Auditoría & Veredicto de Calidad** | C | I | I | I | I | I | I | I | I | C | **R/A** | I | I |
| **Autorización de Pase de Fase** | I | I | I | I | I | I | I | I | I | I | I | I | **R/A** |

---

## Puntos de Fricción Gestionados por la Matriz:
1. **Frontend vs. API:** El desarrollador de API es Responsible (R) por los contratos y esquemas; el Frontend es Consulted (C) para evitar roturas o desajustes de payload.
2. **Backend vs. SQL:** El SQL Developer es Responsible (R) de las migraciones, índices y DDL; el Backend es Consulted (C) para garantizar que las consultas atiendan la lógica de negocio sin migraciones manuales no controladas.
3. **QA vs. Juez de Calidad:** QA es Responsible (R) de diseñar y ejecutar pruebas reales con evidencia; el Juez de Calidad es Accountable (A) de auditar si esa evidencia es válida y suficiente antes de emitir el veredicto.
