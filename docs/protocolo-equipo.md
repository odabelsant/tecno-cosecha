# Protocolo de Trabajo del Equipo — Tecno Cosecha

Este protocolo define las reglas de interacción, el ciclo de vida de los cambios técnicos y la gobernanza del equipo de agentes para el desarrollo de Tecno Cosecha.

---

## 1. Principios de Operación

1. **Secuencialidad Estricta:** Ninguna etapa de desarrollo se inicia sin la culminación y verificación de la etapa precedente.
2. **Sin Suposiciones:** No se da por sentado que un comando, herramienta o entorno está disponible sin verificarlo mediante la terminal.
3. **Trazabilidad Total:** Todo cambio de código debe corresponder a un criterio de aceptación definido por el Product Owner y verificado por QA y el Juez.
4. **Prohibición de Autoaprobación:** Ningún especialista puede validar su propio código. El rol de auditoría recae únicamente en el Juez de Calidad.
5. **Soberanía del Usuario:** El usuario humano es la única entidad facultada para autorizar transiciones de fase, commits, pushes o despliegues.

---

## 2. Flujo Operativo Paso a Paso

### Paso 1: Definición de Alcance y Criterios
* **Responsable:** Product Owner.
* **Acción:** Desglosa los objetivos de la fase en historias de usuario con criterios de aceptación explícitos en formato medible (Checklist o Given-When-Then).
* **Salida:** Requerimientos aprobados.

### Paso 2: Diseño Técnico y de Experiencia
* **Responsables:** Arquitecto de Software y Diseñador UX/UI.
* **Acción:**
  * El Arquitecto define modelos, patrones, boundaries modulares y ADRs.
  * El Diseñador UX/UI define los wireframes, especificaciones de componentes y criterios de accesibilidad.
* **Salida:** Guías técnicas y diseño de interacción listos para construcción.

### Paso 3: Implementación Especializada
* **Responsables:** Frontend, Backend, API, SQL Developer y DevOps.
* **Acción:**
  * Implementan en estricto apego a los diseños y contratos acordados.
  * Mantienen tipado fuerte en TypeScript.
  * Desarrollan sus pruebas unitarias y de integración locales.
* **Salida:** Código funcional y pruebas asociadas.

### Paso 4: Actualización Pedagógica Documental
* **Responsable:** Profesor Agent.
* **Acción:**
  * Inspecciona los cambios reales en el repositorio.
  * Actualiza sincrónicamente `docs/estado-software.md` y `docs/estado-software.html` con las 7 secciones obligatorias (Antes, Cambio, Después, Efecto para el usuario, Sin cambios, Limitaciones, Cómo verificarlo).
* **Salida:** Documentación lista antes de la revisión final.

### Paso 5: Ejecución y Evidencia de Pruebas
* **Responsable:** QA Engineer.
* **Acción:**
  * Ejecuta la batería de pruebas en la terminal contra el código real.
  * Registra comandos exactos, códigos de salida y fragmentos de log.
  * Si detecta defectos, los documenta con pasos exactos de reproducción.
* **Salida:** Reporte de pruebas con evidencia real.

### Paso 6: Puerta de Calidad (Veredicto del Juez)
* **Responsable:** Juez de Calidad.
* **Acción:**
  * Audita los cambios de código, criterios de aceptación y las pruebas de QA.
  * Cuestiona activamente si las pruebas de QA son suficientes, pertinentes y si cubren riesgos latentes.
  * Emite veredicto: `ACEPTADO`, `RECHAZADO` o `BLOQUEADO`.
* **Circuito de Rechazo:**
  * Si el veredicto es `RECHAZADO` o `BLOQUEADO`, el Orquestador solicita correcciones al agente responsable.
  * Una vez corregido, se repiten los pasos 4 (Profesor), 5 (QA) y 6 (Juez).

### Paso 7: Aprobación Humana y Cierre de Fase
* **Responsable:** Usuario Humano.
* **Acción:** El equipo se detiene por completo. El usuario evalúa el veredicto del Juez, la documentación del Profesor y la evidencia técnica, y emite la autorización expresa para avanzar a la siguiente fase.

---

## 3. Mecanismo de Invocación de Agentes

Dado el entorno actual de desarrollo, los agentes se invocan bajo dos modalidades:

### A. Modalidad Asistida por Prompt / Rol (Contextual)
Para activar la mentalidad y límites de un agente específico durante la interacción, se carga su perfil canónico como instrucción de rol:
```markdown
Actúa como [NOMBRE_DEL_AGENTE] según el perfil canónico definido en .agents/roles/[archivo].md.
Respeta rigurosamente tus límites, entregables y criterios para detenerte.
Tarea a ejecutar: [DESCRIPCIÓN DE LA TAREA DENTRO DE LA FASE ACTUAL]
```

### B. Modalidad de Subagente (Herramienta Nativa)
Cuando el entorno soporta agentes en segundo plano o subagentes autónomos, el Orquestador genera una tarea encapsulada inyectando la misión, límites y criterios del perfil correspondiente, exigiendo como salida el entregable formal estipulado.
