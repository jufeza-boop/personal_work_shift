# Personal Work Shift

> PWA para gestionar turnos de trabajo en familia. Permite coordinar calendarios de trabajo, estudios y eventos puntuales entre los miembros de una familia.

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
├── domain/          # Entidades, value objects, interfaces de repositorio
├── application/     # Casos de uso, servicios de aplicación
├── infrastructure/  # Implementaciones Supabase, auth, realtime, offline
├── presentation/    # Componentes React, hooks, validaciones
└── app/             # Rutas Next.js (App Router)
```

**Regla de dependencia**: las capas internas nunca importan de las externas.

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

La app se despliega automáticamente en **Vercel** al hacer push a `main` a través del flujo de CI en `.github/workflows/ci.yml`.

El flujo de CI ejecuta: `format → lint → test → build → deploy`.

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
