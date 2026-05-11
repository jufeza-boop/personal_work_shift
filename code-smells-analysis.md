# Code Smells Analysis

## Metodología

- **Fecha:** 2026-05-11
- **Scope:** `src/`
- **Criterios:** Martin Fowler (*Refactoring: Improving the Design of Existing Code*) + React antipatterns
- **Herramientas:** Inspección manual + ESLint (eslint-config-next/core-web-vitals + eslint-config-next/typescript)

> **Nota sobre SonarJS:** El proyecto no tiene `eslint-plugin-sonarjs` instalado. La detección automatizada se realizó con el conjunto de reglas actualmente configurado (`eslint-config-next`, `@typescript-eslint`). Los resultados de ESLint se indican al final de esta sección.

### Resultado de ESLint (`npx eslint src/`)

```
src/presentation/hooks/__tests__/useSwipeNavigation.test.ts
  33:10  warning  'fireTouchMove' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

El linter detectó únicamente una variable no usada en un archivo de test. El análisis manual identificó los smells más relevantes que ESLint no detecta por su naturaleza estructural o semántica.

---

## 🔍 Code Smells Identificados

---

### 1. DUPLICATE CODE — Delete Dialog duplicado

**Severidad:** 🔴 Alta

**Ubicación:**
- `src/presentation/components/calendar/DayDetailPanel.tsx:81-373`
- `src/presentation/components/events/EventList.tsx:24-193`

**Código:**

```typescript
// DayDetailPanel.tsx (línea 81-85)
interface DeleteDialogState {
  eventId: string;
  eventType: "punctual" | "recurring";
  scope: "all" | "single";
}

// EventList.tsx (línea 24-28) — copia idéntica
interface DeleteDialogState {
  eventId: string;
  eventType: "punctual" | "recurring";
  scope: "all" | "single";
}
```

El diálogo de confirmación de eliminación está completamente duplicado: la interfaz `DeleteDialogState`, el estado con `useState`, `useActionState`, el `<form>` con campos ocultos, los `<input type="radio">` para `scope` (toda la serie / una ocurrencia) y los botones de Cancelar/Eliminar son prácticamente idénticos en ambos componentes.

**Problema:** Cualquier cambio en la lógica de eliminación (por ejemplo, añadir un tercer scope o cambiar textos) debe realizarse en dos lugares con el riesgo de que diverjan.

**Impacto:** Alto riesgo de inconsistencias visuales y de comportamiento; duplicación de tests necesarios; violación del principio DRY.

**Refactor sugerido:** Extraer un componente `DeleteEventDialog` reutilizable que reciba `dialog`, `onClose`, `deleteFormAction`, `deleteState` y `date` como props. Colocarlo en `src/presentation/components/events/DeleteEventDialog.tsx`.

---

### 2. DUPLICATE CODE — `requireAuthenticatedUser` duplicada en Server Actions

**Severidad:** 🟡 Media

**Ubicación:**
- `src/app/actions/events.ts:61-69`
- `src/app/actions/family.ts:45-53`

**Código:**

```typescript
// events.ts
async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

// family.ts — copia byte a byte
async function requireAuthenticatedUser(redirectTo: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
```

**Problema:** La misma función helper de seguridad vive en dos módulos sin ninguna diferencia. Si cambia la ruta de login o la lógica de autenticación, hay que recordar actualizar ambos archivos.

**Impacto:** Riesgo de divergencia en el comportamiento de autenticación entre los distintos grupos de Server Actions.

**Refactor sugerido:** Mover la función a `src/shared/auth/routeProtection.ts` (donde ya existe `sanitizeRedirectPath`) y exportarla desde ahí para ser importada por todos los action modules.

---

### 3. DUPLICATE CODE — Arrays `MONTH_NAMES` en dos componentes

**Severidad:** 🟡 Media

**Ubicación:**
- `src/presentation/components/calendar/CalendarGrid.tsx:27-40`
- `src/presentation/components/calendar/DayDetailPanel.tsx:37-50`

**Código:**

```typescript
// CalendarGrid.tsx — nombres abreviados
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

// DayDetailPanel.tsx — nombres en minúscula para uso en oraciones
const MONTH_NAMES_FULL = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;
```

**Problema:** Dos arrays que representan los meses del año con solo una diferencia de capitalización, definidos en dos componentes distintos del mismo directorio.

**Impacto:** Si se añade un locale o se cambia un nombre de mes, hay que actualizarlo en dos sitios.

**Refactor sugerido:** Crear `src/presentation/utils/dateLocale.ts` con ambos arrays exportados como constantes. También podría centralizarse como una sola fuente derivando la versión en minúscula: `MONTH_NAMES.map(m => m.toLowerCase())`.

---

### 4. DUPLICATE CODE — Regex de validación de hora repetida 6 veces

**Severidad:** 🟡 Media

**Ubicación:** `src/presentation/validation/eventSchemas.ts` (líneas 46, 54, 79, 89, 148, 152, 183, 186, 188...)

**Código:**

```typescript
// Aparece ≥ 6 veces en el mismo archivo:
z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal(""))
```

**Problema:** El patrón regex para validar el formato `HH:MM` y su combinación `.optional().or(z.literal(""))` están inlineados en cada campo de hora sin extraerse a una constante o helper.

**Impacto:** Un error en el patrón o un cambio de especificación (e.g., soportar segundos) requiere modificar todas las ocurrencias. Fácil de olvidar alguna.

**Refactor sugerido:**

```typescript
const TIME_FIELD_SCHEMA = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Formato de hora inválido (HH:MM).")
  .optional()
  .or(z.literal(""));

// Uso:
startTime: TIME_FIELD_SCHEMA,
endTime: TIME_FIELD_SCHEMA,
```

---

### 5. DUPLICATE CODE — Regex de política de contraseña duplicada

**Severidad:** 🟡 Media

**Ubicación:**
- `src/app/actions/auth.ts:273`
- `src/app/actions/auth.ts:304` (como mensaje de error duplicado también en línea 87)
- `src/presentation/validation/authSchemas.ts` (lógica relacionada)

**Código:**

```typescript
// auth.ts — updatePasswordAction (línea 273)
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// El mensaje de error idéntico aparece en 3 lugares:
"La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
```

**Problema:** La regex de política de contraseñas se define inline en `updatePasswordAction` en vez de reutilizar el schema Zod de `authSchemas.ts` que ya valida lo mismo. El mensaje de error también está hardcodeado en múltiples lugares.

**Impacto:** Si cambia la política de contraseñas (e.g., añadir símbolo especial), hay que actualizar la regex y todos los mensajes de error manualmente.

**Refactor sugerido:** Definir la política como constante en `authSchemas.ts` y exportar tanto la regex como el mensaje. `updatePasswordAction` debería usar `authSchemas.updatePasswordSchema.safeParse(...)` en lugar de validar manualmente.

---

### 6. LONG METHOD — `createEventAction` y `editEventAction`

**Severidad:** 🟡 Media

**Ubicación:** `src/app/actions/events.ts:137-545`

**Código:**

```typescript
// createEventAction: ~195 líneas con dos grandes ramas if/else
export async function createEventAction(...) {
  // ... setup ...
  if (eventType === "punctual") {
    // ~50 líneas: parse → validate → resolveCreatedBy → execute → notify → redirect
  }
  if (eventType === "recurring") {
    // ~50 líneas: esencialmente lo mismo con campos distintos
  }
  return { message: "Tipo de evento no reconocido.", success: false };
}
```

**Problema:** Ambas funciones `createEventAction` y `editEventAction` superan 100 líneas efectivas de lógica. Dentro de cada una, las ramas para eventos puntuales y recurrentes duplican el patrón parse → validate → resolveUser → execute → notify → redirect con solo variaciones en los campos del formulario.

**Impacto:** Dificulta la lectura, el testing unitario y la comprensión del flujo de control. Si se añade un tercer tipo de evento, la función crece exponencialmente.

**Refactor sugerido:** Extraer funciones privadas del tipo `handleCreatePunctualEvent(...)` y `handleCreateRecurringEvent(...)` con firmas claras. Alternativamente, abstraer el patrón parse-validate-execute en un helper `parseAndExecute`.

---

### 7. LARGE COMPONENT — `CalendarGrid` con múltiples responsabilidades

**Severidad:** 🔴 Alta

**Ubicación:** `src/presentation/components/calendar/CalendarGrid.tsx:57-350`

**Código:**

```typescript
export function CalendarGrid({ ... }: CalendarGridProps) {
  // Responsabilidad 1: Gestión de estado de eventos
  const [events, setEvents] = useState<SerializedEvent[]>(initialEvents);
  const [exceptions, setExceptions] = useState<SerializedEventException[]>(...);

  // Responsabilidad 2: Cola offline
  const [offlineQueue] = useState(() => new OfflineQueueStore());
  const { isOnline, pendingCount, isSyncing, enqueueOperation } = useOfflineSync(...);

  // Responsabilidad 3: Wrapping de acciones con offline fallback
  const offlineCreateAction = useCallback(...)
  const offlineDeleteAction = useCallback(...)

  // Responsabilidad 4: Sincronización en tiempo real
  const realtimeService = useMemo(() => new SupabaseRealtimeService(...), []);
  useRealtimeSync({ ... });

  // Responsabilidad 5: Navegación por meses y filtros de miembros
  const { year, month, navigate, occurrencesByDate, ... } = useCalendarEvents(...);

  // Responsabilidad 6: Selección de día y apertura de panel
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Responsabilidad 7: Gestos swipe
  useSwipeNavigation({ ... });

  // Responsabilidad 8: Cálculo de celdas del grid y renderizado JSX completo
  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  // ...280 líneas más de JSX
}
```

**Problema:** `CalendarGrid` gestiona 8 responsabilidades distintas mezclando infraestructura (offline, realtime), estado de dominio, lógica de UI y renderizado. Es el antipatrón "God Component" de React.

**Impacto:** Imposible hacer unit tests del renderizado sin mockear toda la infraestructura. Dificulta el entendimiento del flujo de datos. Alta acoplación entre capas.

**Refactor sugerido:** Extraer un hook `useCalendarSync({ familyId, createAction, deleteAction })` que gestione offline+realtime+acciones envueltas. Separar el `<CalendarHeader>` (navegación de mes) como componente propio. El componente principal quedaría en ~80 líneas de JSX puro.

---

### 8. DEAD CODE — Exports deprecated no eliminados

**Severidad:** ⚠ Baja

**Ubicación:** `src/presentation/validation/eventSchemas.ts:107-122, 197-201`

**Código:**

```typescript
// Líneas 107-122
/** @deprecated Use createRecurringEventSchema */
export const createRecurringWorkEventSchema = createRecurringEventSchema;
/** @deprecated Use createRecurringEventSchema */
export const createRecurringOtherEventSchema = createRecurringEventSchema;

export type CreateRecurringWorkEventFormInput = CreateRecurringEventFormInput;
export type CreateRecurringOtherEventFormInput = CreateRecurringEventFormInput;

// Líneas 197-201
/** @deprecated Use editRecurringEventSchema */
export const editRecurringWorkEventSchema = editRecurringEventSchema;
/** @deprecated Use editRecurringEventSchema */
export const editRecurringOtherEventSchema = editRecurringEventSchema;
```

**Problema:** Existen 4 alias de schemas y 2 alias de tipos marcados como `@deprecated` que no son usados en ningún punto del código actual. Son código muerto mantenido "por si acaso".

**Impacto:** Aumenta el tamaño del bundle de servidor. Confunde a quien lee el código sobre cuál schema usar. El `@deprecated` sin fecha de eliminación es una deuda técnica que crece.

**Refactor sugerido:** Verificar con `grep -r "createRecurringWorkEventSchema\|editRecurringWorkEventSchema"` que no haya usos y eliminar los alias. Si hay usos externos, planificar migración en el siguiente sprint.

---

### 9. MAGIC NUMBERS — Números mágicos en lógica de negocio

**Severidad:** 🟡 Media

**Ubicación:**
- `src/app/actions/family.ts:60` — expiración de cookie
- `src/application/services/calendarUtils.ts:138-139, 141` — milisegundos en cálculos
- `src/app/(dashboard)/calendar/page.tsx:41-42` — rango de años válidos

**Código:**

```typescript
// family.ts:60 — ¿30 días? No queda claro sin contexto
maxAge: 60 * 60 * 24 * 30,

// calendarUtils.ts:138
const steps = Math.floor(diff / (frequencyInterval * 86_400_000));
// 86_400_000 = milisegundos en un día, pero no es obvio

// calendar/page.tsx:41-42
paramYear >= 2000 && paramYear <= 2100
// ¿Por qué 2000-2100? No hay constante explicativa
```

**Problema:** Los números `86_400_000`, `60 * 60 * 24 * 30`, `2000`, `2100` están embebidos directamente en la lógica sin una constante con nombre que comunique la intención.

**Impacto:** Reduce la legibilidad; un nuevo desarrollador no sabe inmediatamente que `86_400_000` son milisegundos por día. Cambios futuros (e.g., ajustar rango de años) requieren buscar el número mágico.

**Refactor sugerido:**

```typescript
const MS_PER_DAY = 86_400_000;
const ACTIVE_FAMILY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const CALENDAR_MIN_YEAR = 2000;
const CALENDAR_MAX_YEAR = 2100;
```

---

### 10. MISSING `useCallback` — Funciones en hook recreadas en cada render

**Severidad:** 🟡 Media

**Ubicación:** `src/presentation/hooks/useCalendarEvents.ts:44-64`

**Código:**

```typescript
// Sin useCallback — nueva referencia en cada render
const navigate = (delta: number) => {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  setYear(date.getUTCFullYear());
  setMonth(date.getUTCMonth() + 1);
};

const toggleMember = (userId: string) => {
  setHiddenMemberIds((prev) => { ... });
};
```

**Problema:** `navigate` y `toggleMember` son funciones definidas dentro del hook sin `useCallback`. Se crean nuevas referencias en cada render del componente padre. Si estos callbacks se pasan como props a componentes hijos memoizados (o a hooks con arrays de dependencias), causarán re-renders o re-ejecuciones innecesarias.

**Impacto:** En el contexto actual no causa bugs visibles, pero es una trampa para el rendimiento cuando los componentes hijos sean memoizados, y es inconsistente con el estilo del resto del código (donde sí se usa `useCallback` extensivamente, e.g., `CalendarGrid.tsx`).

**Refactor sugerido:**

```typescript
const navigate = useCallback((delta: number) => {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  setYear(date.getUTCFullYear());
  setMonth(date.getUTCMonth() + 1);
}, [year, month]);

const toggleMember = useCallback((userId: string) => {
  setHiddenMemberIds((prev) => { ... });
}, [members]);
```

---

### 11. INLINE SVG — Icono hardcodeado en lugar de usar la librería de iconos

**Severidad:** ⚠ Baja

**Ubicación:** `src/presentation/components/calendar/CalendarGrid.tsx:255-258`

**Código:**

```typescript
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  className="h-5 w-5"
  aria-hidden="true"
>
  <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625..." />
</svg>
```

**Problema:** El icono de "Filtrar miembros" está codificado como SVG inline de 3 líneas con un path de +100 caracteres. El proyecto ya tiene `lucide-react` como dependencia, que incluye iconos equivalentes (`Users`, `Filter`).

**Impacto:** El SVG inline añade ruido visual en el JSX, dificulta búsquedas/reemplazos de iconos y no se beneficia del tree-shaking ni de la consistencia estilística del sistema de iconos.

**Refactor sugerido:**

```typescript
import { Users } from "lucide-react";
// ...
<Users className="h-5 w-5" aria-hidden="true" />
```

---

### 12. PRIMITIVE OBSESSION — Error codes como string literals no centralizados

**Severidad:** ⚠ Baja

**Ubicación:**
- `src/app/actions/events.ts:626-646` (función `buildErrorMessage`)
- `src/application/use-cases/events/CreateEvent.ts:52-57`
- `src/application/use-cases/events/EditEvent.ts:44-51`
- `src/application/use-cases/events/DeleteEvent.ts`

**Código:**

```typescript
// events.ts
function buildErrorMessage(
  code:
    | "FAMILY_NOT_FOUND"
    | "FORBIDDEN"
    | "INVALID_EVENT"
    | "NOT_A_FAMILY_MEMBER"
    | "EVENT_NOT_FOUND"
    | "INVALID_SCOPE",
): string { ... }
```

**Problema:** Los códigos de error de dominio son string literals repetidos en las definiciones de resultado de los use cases y en el switch de la capa de presentación. No existe una fuente única de verdad (enum, const object, o tipo compartido) para estos códigos.

**Impacto:** Renombrar un código de error requiere buscar y reemplazar manualmente en múltiples archivos. El compilador no detecta typos en los strings. El tipo union en `buildErrorMessage` puede quedar desincronizado con los use cases.

**Refactor sugerido:** Definir los códigos como `const` en el dominio o compartidos:

```typescript
// src/domain/errors/EventErrorCodes.ts
export const EVENT_ERROR_CODES = {
  FAMILY_NOT_FOUND: "FAMILY_NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  INVALID_EVENT: "INVALID_EVENT",
  NOT_A_FAMILY_MEMBER: "NOT_A_FAMILY_MEMBER",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  INVALID_SCOPE: "INVALID_SCOPE",
} as const;

export type EventErrorCode = keyof typeof EVENT_ERROR_CODES;
```

---

## Resumen Ejecutivo

| # | Smell | Tipo | Severidad | Archivo(s) |
|---|-------|------|-----------|------------|
| 1 | Delete Dialog duplicado | Duplicate Code | 🔴 Alta | DayDetailPanel, EventList |
| 2 | `requireAuthenticatedUser` duplicada | Duplicate Code | 🟡 Media | events.ts, family.ts |
| 3 | Arrays `MONTH_NAMES` duplicados | Duplicate Code | 🟡 Media | CalendarGrid, DayDetailPanel |
| 4 | Regex de hora inlinada 6+ veces | Duplicate Code | 🟡 Media | eventSchemas.ts |
| 5 | Regex de contraseña duplicada | Duplicate Code | 🟡 Media | auth.ts |
| 6 | `createEventAction` / `editEventAction` muy largas | Long Method | 🟡 Media | events.ts |
| 7 | `CalendarGrid` con 8 responsabilidades | Large Component | 🔴 Alta | CalendarGrid.tsx |
| 8 | Exports deprecated no eliminados | Dead Code | ⚠ Baja | eventSchemas.ts |
| 9 | Números mágicos en lógica de negocio | Magic Numbers | 🟡 Media | family.ts, calendarUtils.ts |
| 10 | `navigate`/`toggleMember` sin `useCallback` | React antipattern | 🟡 Media | useCalendarEvents.ts |
| 11 | SVG inline en vez de componente de icono | React antipattern | ⚠ Baja | CalendarGrid.tsx |
| 12 | Error codes como string literals dispersos | Primitive Obsession | ⚠ Baja | events.ts, use-cases/ |

### Prioridades de Refactoring

1. **Inmediato (🔴 Alta):** Extraer `DeleteEventDialog` como componente reutilizable; descomponer `CalendarGrid` en hook de sincronización + componentes más pequeños.
2. **Próximo sprint (🟡 Media):** Centralizar `requireAuthenticatedUser`, arrays de meses y regex de hora; dividir `createEventAction`/`editEventAction`; añadir `useCallback` a `useCalendarEvents`.
3. **Deuda técnica planificada (⚠ Baja):** Eliminar exports deprecated; reemplazar SVG inline; centralizar error codes.
