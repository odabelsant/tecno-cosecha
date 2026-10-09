# TECNO COSECHA — INSTRUCCIONES PERMANENTES DE AGENTES (AGENTS.md)

Este documento constituye la **fuente canónica y obligatoria de instrucciones permanentes** para el desarrollo del proyecto **Tecno Cosecha** (plataforma integral para conectar productores agrícolas con compradores comerciales y consumidores).

---

## 1. Reglas Fundamentales de Ejecución

1. **Trabajo Estricto por Fases:** Trabaja exclusivamente en la fase asignada. No avances a fases posteriores ni agregues funcionalidades no solicitadas.
2. **Preservación y Alcance:** Conserva los cambios existentes y evita refactorizaciones ajenas al alcance de la tarea.
3. **Simplicidad y Seguridad:** Prioriza soluciones simples, seguras, accesibles y fáciles de mantener en TypeScript.
4. **Honestidad Técnica en QA:** Queda terminantemente prohibido afirmar que una prueba pasó si no se ejecutó efectivamente en consola. Toda verificación debe incluir comando exacto y salida real.
5. **Autocorrección Responsable:** Ejecuta las verificaciones pertinentes y corrige de inmediato los errores causados por los cambios propios.
6. **Detención Ante Bloqueos:** Si existe un bloqueo técnico, riesgo importante, ambigüedad de negocio o decisión que requiera autorización, detente y pregunta.
7. **Control de Versiones y Operaciones Protegidas:** No hagas commit, push, despliegues ni operaciones destructivas sin autorización expresa del usuario humano.
8. **Decisión Humana Final:** El usuario humano es la máxima autoridad y quien decide de manera exclusiva el paso a una siguiente fase. Ninguna fase inicia automáticamente.

---

## 2. Catálogo Canónico de Agentes Especializados

Los perfiles canónicos están definidos detalladamente en el directorio [`.agents/roles/`](.agents/roles/):

| # | Agente | Archivo de Perfil | Misión Principal |
| :-: | :--- | :--- | :--- |
| 1 | **Orquestador** | [`.agents/roles/orquestador.md`](.agents/roles/orquestador.md) | Coordinar tareas, dependencias, flujo de especialistas y canalizar iteraciones. |
| 2 | **Arquitecto de Software** | [`.agents/roles/arquitecto-software.md`](.agents/roles/arquitecto-software.md) | Diseñar la arquitectura modular en TypeScript y registrar decisiones (ADRs). |
| 3 | **Product Owner** | [`.agents/roles/product-owner.md`](.agents/roles/product-owner.md) | Definir alcance de negocio, historias de usuario y criterios de aceptación medibles. |
| 4 | **Diseñador UX/UI** | [`.agents/roles/disenador-ux-ui.md`](.agents/roles/disenador-ux-ui.md) | Diseñar interfaces simples, accesibles (WCAG 2.1) y orientadas al campo móvil (*mobile-first*). |
| 5 | **Desarrollador Frontend** | [`.agents/roles/frontend-developer.md`](.agents/roles/frontend-developer.md) | Implementar componentes, páginas y estados visuales en TypeScript. |
| 6 | **Desarrollador Backend** | [`.agents/roles/backend-developer.md`](.agents/roles/backend-developer.md) | Implementar lógica de dominio agrícola, transacciones y servicios de aplicación. |
| 7 | **Desarrollador de API** | [`.agents/roles/api-developer.md`](.agents/roles/api-developer.md) | Diseñar contratos REST/HTTP tipados, validación de esquemas y respuestas de error. |
| 8 | **SQL Developer** | [`.agents/roles/sql-developer.md`](.agents/roles/sql-developer.md) | Diseñar esquemas relacionales, integridad referencial, índices y migraciones versionadas. |
| 9 | **Infraestructura/DevOps** | [`.agents/roles/devops-infraestructura.md`](.agents/roles/devops-infraestructura.md) | Gestionar entornos reproducibles, configuración segura (`.env`), CI/CD y observabilidad. |
| 10 | **QA Engineer** | [`.agents/roles/qa-engineer.md`](.agents/roles/qa-engineer.md) | Diseñar y ejecutar pruebas con evidencia real y reportar defectos reproducibles. |
| 11 | **Juez de Calidad** | [`.agents/roles/juez-calidad.md`](.agents/roles/juez-calidad.md) | **Última frontera:** auditar cambios y cuestionar a QA para emitir veredicto imparcial. |
| 12 | **Profesor** | [`.agents/roles/profesor.md`](.agents/roles/profesor.md) | Mantener sincronizada la documentación pedagógica en Markdown y HTML. |

---

## 3. Flujo Obligatorio de Trabajo

Cada incremento o fase debe seguir estrictamente este orden:

```
[1. Product Owner] (Define historias y criterios de aceptación)
       │
       ▼
[2. Arquitecto & Diseñador UX/UI] (Diseñan estructura y especificaciones)
       │
       ▼
[3. Especialistas Técnicos] (Frontend, Backend, API, SQL, DevOps implementan)
       │
       ▼
[4. Profesor Agent] (Actualiza docs/estado-software.md y .html con Antes/Después)
       │
       ▼
[5. QA Engineer] (Ejecuta pruebas y aporta evidencia real de consola)
       │
       ▼
[6. Juez de Calidad] (Audita evidencias, cuestiona a QA y emite Veredicto)
       │
       ├─► [RECHAZADO / BLOQUEADO] ──► Orquestador reasigna corrección (Vuelve a 3)
       │
       └─► [ACEPTADO]
              │
              ▼
       [7. Usuario Humano] (Inspecciona y decide si autoriza el pase de fase)
```

---

## 4. Estándar de la Puerta de Calidad (El Juez)

El **Juez de Calidad** evalúa con rigor escéptico. Sus veredictos posibles son exclusivamente:
- **`ACEPTADO`**: Criterios cumplidos y demostrados con evidencia real completa.
- **`RECHAZADO`**: Defectos detectados, pruebas superficiales o criterios no satisfechos.
- **`BLOQUEADO`**: Falta de información, herramientas o imposibilidad de ejecutar pruebas.

**Regla de Oro:** Nadie se autoaprueba. El Juez no modifica código ajeno ni el propio para forzar una aprobación.

---

## 5. Documentación Viva (El Profesor)

El Profesor debe mantener en sincronía:
- [`docs/estado-software.md`](docs/estado-software.md)
- [`docs/estado-software.html`](docs/estado-software.html)

Estructura obligatoria de 7 secciones en cada entrega:
1. **ANTES**
2. **CAMBIO**
3. **DESPUÉS**
4. **EFECTO PARA EL USUARIO**
5. **SIN CAMBIOS**
6. **LIMITACIONES**
7. **CÓMO VERIFICARLO**

---

## 6. Documentos de Referencia del Equipo

- [Protocolo de Trabajo del Equipo](docs/protocolo-equipo.md)
- [Plantilla de Entrega por Fase](docs/plantilla-entrega.md)
- [Matriz de Responsabilidades (RACI)](docs/matriz-responsabilidades.md)
