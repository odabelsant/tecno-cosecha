# Tecno Cosecha — Marketplace Agrícola

Plataforma integral orientada a dispositivos móviles (*mobile-first*) para conectar a productores agrícolas con compradores comerciales (colmados, restaurantes, mayoristas) y consumidores en República Dominicana.

---

## 🚀 Requisitos del Sistema
* **Node.js:** `>= 20.0.0` (Verificado y probado en `v24.4.1`)
* **npm:** `>= 10.0.0` (Verificado y probado en `11.21.0`)
* **Git:** `>= 2.40.0` (Verificado en `2.50.1`)

---

## 🛠️ Instalación y Configuración Paso a Paso

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd "Tecno Cosecha"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla de variables de entorno (sin secretos):
```bash
cp .env.example .env.local
```
*(Puedes ajustar `PORT` o `DATABASE_URL` en `.env.local` si es necesario).*

---

## 🧪 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run typecheck` | Ejecuta la verificación estricta de tipos con TypeScript (`tsc --noEmit`). |
| `npm test` | Ejecuta la suite de pruebas unitarias y de integración con **Vitest**. |
| `npm run lint` | Ejecuta el análisis estático de código con **ESLint**. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:3000`. |
| `npm start` | Inicia la aplicación en modo producción tras compilar. |

---

## 📁 Estructura del Proyecto

```text
Tecno Cosecha/
├── .agents/               # Perfiles canónicos de los 12 agentes especializados
├── docs/                  # Documentación canónica, protocolo, alcance, ADRs y estado
│   ├── adr/               # Registros de Decisiones Arquitectónicas (ADR-001 a ADR-004)
│   ├── alcance-mvp.md     # Especificación funcional del MVP (Product Owner)
│   ├── arquitectura-sistema.md # Diseño técnico, módulos y entidades (Arquitecto)
│   ├── estado-software.md # Seguimiento pedagógico en Markdown (Profesor)
│   └── estado-software.html # Vista visual accesible sincronizada (Profesor)
├── src/
│   ├── app/               # Enrutamiento, vistas y endpoints de API (Next.js App Router)
│   │   ├── api/health/    # Comprobación de salud / observabilidad
│   │   ├── layout.tsx     # Layout raíz HTML5 semántico y accesible
│   │   └── page.tsx       # Página principal con estado de la plataforma
│   ├── config/            # Validación tipada de variables de entorno (env.ts)
│   └── modules/           # Módulos de dominio modular (ADR-002)
│       ├── catalog/       # Publicaciones, categorías y unidades agrícolas
│       ├── claims/        # Incidencias y mediación
│       ├── identity/      # Usuarios, perfiles y roles
│       └── orders/        # Pedidos y máquina de estados transaccional
├── tests/                 # Batería de pruebas automatizadas (Vitest)
│   ├── config.test.ts     # Pruebas de cargador de entorno
│   └── sanity.test.ts     # Pruebas de sanidad y módulos
├── .env.example           # Plantilla segura de variables de entorno
├── .gitignore             # Exclusión estricta de secretos y artefactos
├── AGENTS.md              # Instrucciones permanentes de gobernanza
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración estricta de TypeScript
└── vitest.config.ts       # Configuración del test runner
```

---

## 🔒 Seguridad y Manejo de Secretos
* Todos los archivos `.env*` con valores sensibles están estrictamente ignorados en `.gitignore`.
* Ninguna clave de producción, contraseña o secreto debe comitearse al repositorio.
* La verificación de salud y configuración se encuentra disponible en `http://localhost:3000/api/health`.
