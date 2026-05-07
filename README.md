# Personal Work Shift

> PWA para gestionar turnos de trabajo en familia. Permite coordinar calendarios de trabajo, estudios y eventos puntuales entre los miembros de una familia.

Personal Work Shift está diseñado para familias donde varios miembros tienen horarios laborales rotativos o irregulares (turnos de mañana, tarde, noche, festivos, etc.). El objetivo es tener una única vista compartida del calendario familiar, evitar conflictos de planificación y permitir a cada miembro gestionar su propio calendario — o el de otra persona bajo su cargo — desde cualquier dispositivo, incluso sin conexión a internet.

---

## Características

- 📅 **Calendario mensual interactivo** — visualización de turnos y eventos en cuadrícula completa, optimizada para móvil y escritorio.
- 👨‍👩‍👧 **Gestión familiar** — crea familias, invita miembros y asigna paletas de colores personalizadas.
- 🔁 **Eventos recurrentes y puntuales** — soporta turnos de trabajo diarios/semanales/anuales, estudios y eventos únicos.
- 👤 **Usuarios delegados** — gestiona calendarios de otras personas en tu nombre.
- 🌐 **Funciona sin conexión** — operaciones offline con sincronización automática al recuperar la red.
- 🔔 **Notificaciones push** — opt-in para recibir alertas de cambios en el calendario familiar.
- 📱 **PWA instalable** — añade la app a la pantalla de inicio en móvil o escritorio.
- 🔄 **Sincronización en tiempo real** — los cambios de otros miembros aparecen al instante vía Supabase Realtime.

---

## Stack tecnológico

| Capa          | Tecnología                                        |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 15+ (App Router, React Server Components) |
| Lenguaje      | TypeScript (strict mode)                          |
| Estilos       | Tailwind CSS v4 + shadcn/ui                       |
| Base de datos | Supabase (PostgreSQL + RLS)                       |
| Autenticación | Supabase Auth                                     |
| Tiempo real   | Supabase Realtime                                 |
| PWA           | Serwist (Service Worker)                          |
| Testing       | Vitest + React Testing Library + Playwright       |
| Despliegue    | Vercel                                            |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con separación estricta de capas:

```
src/
├── domain/                  # Capa de dominio — TypeScript puro, sin dependencias externas
│   ├── entities/            # Entidades de negocio (Event, Family, User…)
│   ├── value-objects/       # Objetos de valor (Color, ShiftType…)
│   ├── repositories/        # Interfaces de repositorio (contratos)
│   ├── rules/               # Reglas de negocio puras
│   └── errors/              # Errores de dominio personalizados
├── application/             # Casos de uso y orquestación
│   ├── use-cases/           # Un archivo por caso de uso
│   ├── services/            # Servicios de aplicación reutilizables
│   └── dto/                 # Data Transfer Objects
├── infrastructure/          # Implementaciones concretas e integraciones externas
│   ├── supabase/            # Cliente Supabase y helpers
│   ├── auth/                # Implementación de autenticación (Supabase Auth)
│   ├── events/              # Repositorio de eventos (Supabase)
│   ├── family/              # Repositorio de familias (Supabase)
│   ├── invitation/          # Gestión de invitaciones
│   ├── realtime/            # Suscripciones Supabase Realtime
│   ├── offline/             # Cola offline e IndexedDB
│   ├── push/                # Notificaciones push (Web Push API)
│   ├── storage/             # Almacenamiento de archivos
│   └── security/            # Utilidades de seguridad
├── presentation/            # Componentes React y lógica de UI
│   ├── components/          # Componentes reutilizables
│   ├── hooks/               # Custom hooks de React
│   ├── validation/          # Esquemas Zod para formularios
│   └── utils/               # Utilidades de presentación
├── shared/                  # Código compartido entre capas
├── test/                    # Utilidades y mocks globales de tests
└── app/                     # Rutas Next.js (App Router)
    ├── (auth)/              # Páginas de autenticación (login, registro)
    ├── (dashboard)/         # Páginas protegidas (calendario, familia…)
    ├── actions/             # Server Actions de Next.js
    ├── api/                 # Route Handlers de Next.js
    ├── invite/              # Página de aceptación de invitaciones
    ├── ~offline/            # Página de fallback offline (PWA)
    ├── serwist/             # Configuración del Service Worker
    ├── manifest.ts          # Web App Manifest dinámico
    └── layout.tsx           # Layout raíz
```

**Regla de dependencia**: las capas internas nunca importan de las externas.

```
Domain ← Application ← Infrastructure
                    ↑
              Presentation → app/
```

### Estructura del repositorio

```
personal_work_shift/
├── src/                     # Código fuente (ver árbol anterior)
├── e2e/                     # Tests end-to-end con Playwright
│   ├── auth.spec.ts
│   ├── calendar.spec.ts
│   ├── events.spec.ts
│   ├── family.spec.ts
│   ├── accessibility.spec.ts
│   ├── mobile-responsiveness.spec.ts
│   └── pwa.spec.ts
├── supabase/                # Configuración de Supabase CLI
│   ├── migrations/          # Migraciones SQL versionadas
│   ├── seed.sql             # Datos de prueba
│   └── config.toml          # Configuración del proyecto Supabase
├── doc/                     # Documentación técnica
│   ├── architecture.md
│   ├── user-stories.md
│   └── security.md
├── public/                  # Assets estáticos e iconos PWA
├── scripts/                 # Scripts auxiliares de desarrollo
├── .github/                 # Workflows de CI/CD (GitHub Actions)
├── next.config.ts           # Configuración de Next.js
├── vitest.config.ts         # Configuración de Vitest
├── playwright.config.ts     # Configuración de Playwright
└── tsconfig.json            # Configuración de TypeScript (strict)
```

---

## Primeros pasos

### Requisitos previos

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jufeza-boop/personal_work_shift.git
cd personal_work_shift

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Desarrollo local

```bash
# Iniciar Supabase local
npx supabase start

# Aplicar migraciones
npx supabase db push

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Tests unitarios (Vitest)
npm run test:e2e   # Tests end-to-end (Playwright)
```

---

## Testing

El proyecto sigue **TDD** de manera estricta. Antes de cada cambio se escribe primero el test fallido.

```
Cobertura mínima:
  Domain:         95%+
  Application:    90%+
  Infrastructure: 80%+
  Presentation:   80%+
```

---

## Despliegue

La app se despliega automáticamente en **Vercel** al hacer push a `main`.

El flujo de CI `.github/workflows/ci.yml` ejecuta: `format → lint → test → build`.

---

### 🛠️ Troubleshooting: Mi Realtime no funciona

Si los cambios en la base de datos no se reflejan automáticamente en la App, sigue este checklist:

1. **Check de Publicación**: Ve a `Database > Replication > supabase_realtime` y asegúrate de que la tabla (ej: `events`) esté marcada como **Enabled**.
2. **Check de Identidad**: Si los `UPDATE` funcionan pero los `DELETE` no, es que falta la identidad completa. Ejecuta:
   ```sql
   ALTER TABLE nombre_de_tabla REPLICA IDENTITY FULL;
   ```

---

## Licencia

Proyecto privado — todos los derechos reservados.
