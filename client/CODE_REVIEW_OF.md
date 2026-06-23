# Code Review — OTB Miraflores Web App Frontend

**Reviewer:** Staff Engineer (automated deep review)  
**Date:** 2026-04-18  
**Branch:** `code_review`  
**Stack:** React 18 · TypeScript 5.6 · Vite 6 · React Router 7 · Material-Tailwind 2 · Tailwind CSS 3  
**Scope:** Full codebase audit — seguridad, arquitectura, calidad, performance, testing  

---

## Resumen Ejecutivo

La aplicación es un backoffice para la gestión de una OTB (Organización Territorial de Base): vecinos, reuniones, mediciones de agua y recaudaciones. El código es funcional en el happy path, pero presenta **deuda técnica significativa** que impide su paso a producción sin correcciones urgentes. Se identificaron **2 vulnerabilidades críticas**, **6 hallazgos de severidad alta** y múltiples problemas de calidad media/baja.

---

## Tabla de Hallazgos por Severidad

| ID | Severidad | Área | Título |
|----|-----------|------|--------|
| F-01 | 🔴 CRÍTICO | Seguridad | Credenciales hardcodeadas en código fuente |
| F-02 | 🔴 CRÍTICO | Seguridad + Runtime | `require('jspdf')` en módulo ESM — dependencia inexistente |
| F-03 | 🟠 ALTO | Seguridad | Datos sensibles de pago enviados como query string |
| F-04 | 🟠 ALTO | Seguridad | Ausencia de `credentials: 'include'` en la mayoría de llamadas API |
| F-05 | 🟠 ALTO | Arquitectura | Endpoints hardcodeados en 6 archivos, ignorando el sistema de config |
| F-06 | 🟠 ALTO | Bugs | `useFetchData` — `isLoading` inicializa en `true` sin request activo |
| F-07 | 🟠 ALTO | Bugs | `useEffect` con dependencia `execute` omitida — violación React Hooks |
| F-08 | 🟠 ALTO | Calidad | `newPaymentModalForm.tsx` — archivo vacío en producción |
| F-09 | 🟡 MEDIO | Arquitectura | Tipos duplicados en múltiples archivos |
| F-10 | 🟡 MEDIO | Arquitectura | Patrones de fetch inconsistentes en toda la app |
| F-11 | 🟡 MEDIO | Arquitectura | `App.tsx` usado como layout wrapper desde `ProtectedRoute`, rompiendo convenciones de React Router |
| F-12 | 🟡 MEDIO | Calidad | 130+ líneas comentadas en `Measures.tsx` |
| F-13 | 🟡 MEDIO | Calidad | `console.log` con datos de negocio en código de producción |
| F-14 | 🟡 MEDIO | Calidad | `window.confirm()` para operaciones destructivas |
| F-15 | 🟡 MEDIO | Calidad | Ruta `/Reuniones` con mayúscula — inconsistencia de convenciones |
| F-16 | 🟡 MEDIO | Calidad | `JSON.parse()` para parsear booleanos de entorno |
| F-17 | 🟡 MEDIO | Performance | Double spinner en `Measures.tsx` — doble render condicional con el mismo flag |
| F-18 | 🟡 MEDIO | Calidad | Código muerto: `DataTable.tsx`, `_NavbarApp.tsx`, `CheckLayout`, `Receipts` |
| F-19 | 🔵 BAJO | UX | `handleViewMeet` / `handleEditMeet` — funcionalidad no implementada con toast de "en desarrollo" |
| F-20 | 🔵 BAJO | Testing | Cobertura de tests: 0% |
| F-21 | 🔵 BAJO | Accesibilidad | Sin `aria-label` en botones de icono, sin gestión de foco en modales |
| F-22 | 🔵 BAJO | Performance | Sin code splitting / React.lazy |
| F-23 | 🔵 BAJO | Arquitectura | Sin manejo de errores global (Error Boundaries) |

---

## Hallazgos Detallados

---

### F-01 — 🔴 CRÍTICO | Credenciales hardcodeadas en código fuente

**Archivo:** `src/pages/login/Login.tsx:101,122`

```tsx
// LÍNEA 101
<Input
  label='Usuario'
  value='sergio.cardenas'   // ← credencial hardcodeada
  {...register('username', { required: true })}
/>

// LÍNEA 122
<Input
  type='password'
  value={'123456'}          // ← contraseña hardcodeada
  {...register('password', { required: true })}
/>
```

**Impacto:** Las credenciales quedan embebidas en el bundle JS que se sirve al cliente y en el historial de git. Cualquier persona con acceso al código fuente o DevTools obtiene credenciales válidas del sistema. Si el repositorio es o fue público (o se compromete), estas credenciales quedan expuestas indefinidamente en el historial.

**Adicionalmente:** El atributo `value` en un input controlado por `react-hook-form` entra en conflicto con el `register` — el campo nunca sincroniza correctamente el valor interno del formulario, lo cual es un bug funcional además del problema de seguridad.

**Acción requerida:**
```tsx
// Eliminar los atributos value. Si se necesitan defaults para development:
// Opción 1: usar defaultValues en useForm()
const { register, handleSubmit } = useForm<Inputs>({
  defaultValues: import.meta.env.DEV
    ? { username: import.meta.env.VITE_DEV_USER, password: import.meta.env.VITE_DEV_PASS }
    : {},
});
// Opción 2: simplemente removerlos. Un engineer puede escribir sus credenciales.
```

**Severidad:** CRÍTICO — Requiere fix inmediato + rotación de credenciales expuestas.

---

### F-02 — 🔴 CRÍTICO | `require('jspdf')` en módulo ESM — dependencia inexistente

**Archivo:** `src/components/modals/CollectDebtPaymentsModal.tsx:200`

```tsx
const generateReceipt = (paymentData: any, neighborName: string) => {
  const { jsPDF } = require('jspdf');  // ← require() en ES module, jspdf no está en package.json
  const doc = new jsPDF();
  // ...
};
```

**Dos problemas simultáneos:**

1. **`require()` no existe en ES modules** (el proyecto usa `"type": "module"` en `package.json`). Esto lanzará `ReferenceError: require is not defined` en runtime cada vez que un usuario registre un pago.

2. **`jspdf` no está en `package.json`**. La dependencia no existe. El proyecto SÍ tiene `@react-pdf/renderer` instalado, pero no se usa aquí.

**Impacto:** La funcionalidad de generar recibos PDF — que parece ser el flujo principal de recaudaciones — falla completamente en runtime para todos los usuarios. Es un bug crítico que bloquea una feature core.

**El proyecto tiene `@react-pdf/renderer` en dependencies pero no se usa para esto.** Inconsistencia entre lo instalado y lo utilizado.

**Acción requerida:**
```bash
# Opción A: usar la dependencia ya instalada
# Migrar generateReceipt() a un componente @react-pdf/renderer

# Opción B: instalar jspdf correctamente
pnpm add jspdf
# Y cambiar el import:
import jsPDF from 'jspdf';  // import estático, no require()
```

**Severidad:** CRÍTICO — Crash garantizado en producción al registrar cualquier pago.

---

### F-03 — 🟠 ALTO | Datos sensibles enviados como query string

**Archivo:** `src/components/modals/CollectDebtPaymentsModal.tsx:330-337`

```tsx
const response = await fetch(
  `${apiLink}/collect-debts/${collectDebt?.id}/payments?neighbor_id=${selectedNeighbor}&total_amount=${totalAmount}&payment_method=${paymentMethod}&reference_number=${referenceNumber}&received_by=${receivedBy}&notes=${notes}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ debt_items: debtItems }),
  }
);
```

**Problemas:**

1. **Datos financieros en URL:** `total_amount`, `reference_number`, `notes` aparecen en query string → quedan en logs de servidor, historial del navegador, proxies, headers `Referer`, analíticas.

2. **Diseño de API incorrecto:** Un `POST` con payload en body Y parámetros de negocio en query string es semánticamente inconsistente. Todo debe ir en el body.

3. **`notes` sin encoding:** Si `notes` contiene caracteres especiales (`&`, `=`, `?`), trunca silenciosamente la request o la corrompe.

**Acción requerida:**
```tsx
const response = await fetch(`${apiLink}/collect-debts/${collectDebt?.id}/payments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    neighbor_id: selectedNeighbor,
    total_amount: totalAmount,
    payment_method: paymentMethod,
    reference_number: referenceNumber,
    received_by: receivedBy,
    notes: notes,
    debt_items: debtItems,
  }),
});
```

---

### F-04 — 🟠 ALTO | Ausencia de `credentials: 'include'` en llamadas API

**Archivos afectados:** `Neighbors.tsx`, `Meetings.tsx`, `Collections.tsx`, `CollectDebtPaymentsModal.tsx`, `NeighborDetailModal.tsx`

El sistema usa autenticación basada en cookies de sesión (el login hace `credentials: 'include'` y el backend retorna una cookie). Sin embargo, la gran mayoría de llamadas API omiten esta opción:

```tsx
// Neighbors.tsx:50 — sin credentials
fetch(apiLink, { method: 'GET' })

// NeighborDetailModal.tsx:154 — sin credentials
const metersResponse = await fetch(`${apiLink}/neighbors/${neighbor.id}/meters`);

// CollectDebtPaymentsModal.tsx:140 — sin credentials
const response = await fetch(`${apiLink}/collect-debts/${collectDebt.id}/payments`);
```

**Impacto:** Si el backend valida sesión en endpoints protegidos (como debería), **todas estas requests fallan con 401/403 silenciosamente**. El frontend no muestra error porque tampoco valida `response.ok` en todos los casos. En un backend Django/FastAPI típico con `credentials: 'include'` obligatorio, la app completa no funciona en producción.

**Acción requerida:** Centralizar las llamadas en un `apiClient` con `credentials: 'include'` por defecto:

```ts
// src/services/apiClient.ts
const BASE_URL = JSON.parse(config.production) ? config.frontURL_PROD : config.frontURL_DEV;

export const apiClient = {
  get: (path: string) =>
    fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(handleResponse),
  post: (path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),
  // delete, put...
};
```

---

### F-05 — 🟠 ALTO | Endpoints hardcodeados ignorando el sistema de config

**Archivos:**

| Archivo | Línea | URL hardcodeada |
|---------|-------|-----------------|
| `src/hooks/useMeasuresData.ts` | 6 | `http://127.0.0.1:8000/measures` |
| `src/hooks/useMeasureReadings.ts` | 5 | `http://127.0.0.1:8000` |
| `src/pages/meetings/Meetings.tsx` | 41 | `http://127.0.0.1:8000/meets` |
| `src/pages/collections/Collections.tsx` | 37 | `http://127.0.0.1:8000/collect-debts` |
| `src/components/modals/NeighborDetailModal.tsx` | 140 | `http://127.0.0.1:8000` |
| `src/components/modals/CollectDebtPaymentsModal.tsx` | 120 | `http://127.0.0.1:8000` |

El proyecto tiene `src/config.ts` con `VITE_BACKEND_URL_PROD` / `VITE_BACKEND_URL_DEV`, y `Neighbors.tsx` lo usa correctamente. Los demás 6 archivos lo ignoran completamente.

**Impacto:** La app apunta a `localhost` en producción → las requests fallan para todos los usuarios menos para quien tiene el backend corriendo en su máquina.

---

### F-06 — 🟠 ALTO | `useFetchData` — `isLoading` inicializa en `true` sin request activo

**Archivo:** `src/hooks/useFetchData.ts:5`

```ts
const useFetchData = <T>(url: string) => {
  const [isLoading, setIsLoading] = useState(true);  // ← true antes de llamar a execute()
  // ...
  const execute = async (options?: RequestInit) => {
    setIsLoading(true);
    // ...
  };
  return { data, isLoading, error, execute };
};
```

**Problema:** Cada componente que usa `useFetchData` muestra spinner desde el primer render, antes de que se haya iniciado ninguna request. Si el componente usa el hook pero no llama `execute()` inmediatamente (o si `execute()` se llama en `useEffect`), hay un frame de loading falso. Más grave: si `execute()` nunca se llama, `isLoading` se queda en `true` indefinidamente.

**El estado correcto es `false` hasta que se inicia explícitamente una petición:**
```ts
const [isLoading, setIsLoading] = useState(false);
```

---

### F-07 — 🟠 ALTO | `useEffect` con dependencia `execute` omitida

**Archivos:** `src/hooks/useMeasuresData.ts:9-14`, `src/hooks/useMeasureReadings.ts:9-14`

```ts
// useMeasuresData.ts
useEffect(() => {
  execute({
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}, []);  // ← execute omitido del array de dependencias
```

**Problema:** `execute` es una función recreada en cada render de `useFetchData` (no está memoizada con `useCallback`). El eslint-plugin-react-hooks debería reportar esto como `react-hooks/exhaustive-deps`. Al omitirlo, el efecto captura un `execute` stale.

**Riesgo adicional:** Si alguna vez se añade un re-render entre la creación del hook y el `useEffect`, se ejecuta la versión antigua de `execute` con la URL anterior.

**Fix en `useFetchData`:**
```ts
const execute = useCallback(async (options?: RequestInit) => {
  // ...
}, [url]);
```

---

### F-08 — 🟠 ALTO | `newPaymentModalForm.tsx` — archivo vacío en producción

**Archivo:** `src/components/forms/newPaymentModalForm.tsx`

El archivo existe con **0 líneas de contenido útil**. Está importado/referenciado en el sistema pero no contiene ningún componente exportado.

**Impacto:** Si algún otro archivo intenta importar de aquí, falla en build time. Si está importado dinámicamente, falla en runtime.

**Acción:** Implementar el componente o eliminar el archivo y limpiar referencias.

---

### F-09 — 🟡 MEDIO | Tipos duplicados en múltiples archivos

Los siguientes tipos están definidos localmente en componentes en lugar de estar centralizados:

| Tipo | Definido en |
|------|-------------|
| `NeighborType` | `src/interfaces/neighborsInterfaces.ts` ✓ y `NeighborDetailModal.tsx:27`, `CollectDebtPaymentsModal.tsx:33` |
| `DebtItemType` | `NeighborDetailModal.tsx:48` y `CollectDebtPaymentsModal.tsx:41` — definiciones distintas |
| `PaymentType` | `NeighborDetailModal.tsx:79` y `CollectDebtPaymentsModal.tsx:62` — `neighbor_name` solo en uno |
| `CollectDebtType` | `Collections.tsx:8` y `CollectDebtPaymentsModal.tsx:20` — campos distintos |
| `MeetType` | `Meetings.tsx:8` y presumiblemente en `MeetTable.tsx` |

**El `DebtItemType` en `CollectDebtPaymentsModal` omite campos presentes en `NeighborDetailModal`** (`neighbor_id`, `debt_type_id`, `amount_paid`, `balance`, `is_overdue`, etc.). Estas divergencias silenciosas son una fuente de bugs difíciles de rastrear.

**Acción requerida:** Crear `src/types/index.ts` o `src/types/domain.ts` con todos los tipos de dominio y exportarlos desde ahí.

---

### F-10 — 🟡 MEDIO | Patrones de fetch inconsistentes en toda la app

Existen **tres patrones distintos** de data fetching sin coordinación:

**Patrón 1 — fetch nativo directo** (Neighbors.tsx, Meetings.tsx, Collections.tsx):
```ts
fetch(apiLink, { method: 'GET' })
  .then(res => res.json())
  .then(json => setData(json))
  .catch(err => console.error(err));
```

**Patrón 2 — hook genérico `useFetchData`** (AuthContext.tsx, Login.tsx):
```ts
const { execute } = useFetchData(url);
const result = await execute({ method: 'POST', ... });
```

**Patrón 3 — custom domain hooks** (Measures.tsx):
```ts
const { data, isLoading } = useMeasuresData();
```

Los tres coexisten sin convención definida. El Patrón 1 no reutiliza el hook que fue creado para abstracción. El Patrón 3 es la dirección correcta pero solo existe para `measures`.

**Impacto en mantenibilidad:** Al modificar el comportamiento de las requests (e.g., agregar auth header, timeout, retry) hay que hacerlo en 3 lugares distintos.

---

### F-11 — 🟡 MEDIO | `App.tsx` usado como layout wrapper desde `ProtectedRoute`

**Archivo:** `src/components/ProtectedRoute.tsx:23`

```tsx
return isAuthenticated ? <App /> : <Navigate to="/login" replace />;
```

**Archivo:** `src/main.tsx:37`

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Neighbors />} />
  ...
</Route>
```

`App.tsx` renderiza un `<Outlet />`, pero no es el `element` de ninguna `<Route>` — es devuelto directamente desde `ProtectedRoute`. Esto rompe la convención de React Router 7 donde los layouts deben ser `element` de Routes con `<Outlet>`.

**Consecuencias:**
- El `<Outlet>` de `App.tsx` no recibe el contexto de rutas de React Router correctamente.
- Si se quiere proteger rutas a nivel de layout, la lógica de auth está en el lugar incorrecto.
- `useLocation()` en `App.tsx` funciona por accidente — si el árbol cambia, puede dejar de funcionar.

**Patrón correcto:**
```tsx
// ProtectedRoute.tsx
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// main.tsx
<Route element={<ProtectedRoute />}>
  <Route element={<App />}>   {/* App como layout */}
    <Route path="/vecinos" element={<Neighbors />} />
    ...
  </Route>
</Route>
```

---

### F-12 — 🟡 MEDIO | 130+ líneas comentadas en `Measures.tsx`

**Archivo:** `src/pages/measures/Measures.tsx:31-194`

El archivo contiene ~165 líneas de código comentado — prácticamente la totalidad de la lógica de la página. El código funcional activo es mínimo y parte está incompleto (`onSubmit` del formulario tiene un handler vacío):

```tsx
<NewMeasureModalForm
  openModalState={openModal}
  handleCloseModal={handleOpenModal}
  onSubmit={(data) => {
    // handleCreateMeasure(data);  ← no hace nada
  }}
/>
```

Hay también un `getMeasureByPeriod` definido (línea 196) que **no se llama en ningún lugar del JSX activo**.

**El código comentado es ruido**. Si fue reemplazado por los hooks, debe eliminarse. Si está "en pausa", debe vivir en una rama de git, no en el código.

---

### F-13 — 🟡 MEDIO | `console.log` con datos de negocio en producción

**Archivos:**

```ts
// Meetings.tsx:97
console.log('Ver reunión:', meet);   // datos de reunión

// Meetings.tsx:104
console.log('Editar reunión:', meet);

// Collections.tsx:90
console.log('Ver recaudación:', collectDebt);

// Collections.tsx:97
console.log('Editar recaudación:', collectDebt);
```

En producción, esto expone datos de negocio (IDs, fechas, nombres) en la consola del navegador, accesible para cualquier usuario con DevTools.

**Acción:** Eliminar todos los `console.log` de negocio. Si se necesita debug condicional, usar `import.meta.env.DEV && console.log(...)`.

---

### F-14 — 🟡 MEDIO | `window.confirm()` para operaciones destructivas

**Archivos:** `Meetings.tsx:110`, `Collections.tsx:103`

```tsx
if (window.confirm(`¿Está seguro de eliminar la reunión "${meet.title}"?`)) {
```

`window.confirm()` bloquea el hilo principal, no respeta el diseño del sistema de UI (Material-Tailwind), y en algunos navegadores/contextos embedded puede estar deshabilitado y retornar siempre `false`.

El proyecto ya tiene `DeleteNeighborModal` como patrón correcto. La misma solución debe aplicarse a Meetings y Collections.

---

### F-15 — 🟡 MEDIO | Ruta `/Reuniones` con mayúscula — convención inconsistente

**Archivo:** `src/main.tsx:40`

```tsx
<Route path="/Reuniones" element={<Meetings />} />   // ← mayúscula
<Route path="/recaudaciones" element={<Collections />} />  // ← minúscula
<Route path="/vecinos" element={<Neighbors />} />
<Route path="/mediciones" element={<Measures />} />
```

Las URLs son case-sensitive en la mayoría de servidores. `/reuniones` y `/Reuniones` son rutas distintas. Los links de navegación deben coincidir exactamente con la definición, y la convención debe ser uniforme (lowercase).

---

### F-16 — 🟡 MEDIO | `JSON.parse()` para leer un booleano de entorno

**Archivos:** `src/pages/login/Login.tsx:35`, `src/components/AuthContext.tsx:31`, `src/pages/neighbors/Neighbors.tsx:27`

```ts
JSON.parse(config.production) ? config.frontURL_PROD : config.frontURL_DEV
```

`import.meta.env` siempre devuelve strings. `JSON.parse('true')` funciona, pero `JSON.parse(undefined)` lanza `SyntaxError` si `VITE_PROD` no está definida. Además, es innecesariamente frágil para lo que hace.

**Patrón correcto — en `config.ts`:**
```ts
export const config = {
  frontURL_PROD: import.meta.env.VITE_BACKEND_URL_PROD ?? '',
  frontURL_DEV: import.meta.env.VITE_BACKEND_URL_DEV ?? '',
  production: import.meta.env.VITE_PROD === 'true',  // boolean directo
};

// Uso:
const apiBase = config.production ? config.frontURL_PROD : config.frontURL_DEV;
```

---

### F-17 — 🟡 MEDIO | Double spinner en `Measures.tsx`

**Archivo:** `src/pages/measures/Measures.tsx:202-256`

```tsx
{loadingMeasuresData ? (
  <ClipLoader ... />  // ← primer spinner
) : (
  <div>...</div>
)}
{loadingMeasuresData ? (
  <ClipLoader ... />  // ← segundo spinner idéntico, innecesario
) : (
  <></>   // ← Fragmento vacío explícito — sin valor
)}
```

El segundo bloque condicional no renderiza nada útil en ninguno de los dos casos. El fragmento vacío `<></>` cuando no está cargando es literalmente nada. Esto genera renders innecesarios y confusión de lectura.

---

### F-18 — 🟡 MEDIO | Código muerto acumulado

| Archivo | Estado |
|---------|--------|
| `src/components/DataTable.tsx` | Componente nunca importado en ningún lugar de la app |
| `src/components/_NavbarApp.tsx` | Prefijo `_` indica deprecado; comentado en `App.tsx` |
| `src/pages/receipts/Receipts.tsx` | Importado pero comentado en `main.tsx` |
| `src/pages/checkDebts/CheckLayout.tsx` | Comentado en `main.tsx` |
| `src/pages/checkDebts/CheckNeighborsDebts.tsx` | Comentado en `main.tsx` |
| `src/components/navigation/NavBarComponent.tsx` | Comentado en `App.tsx` |

**El código comentado/muerto no debe vivir en `main`. Si no está listo, va en una branch o se elimina.**

---

### F-19 — 🔵 BAJO | Funciones con `TODO` expuestas al usuario como "en desarrollo"

**Archivo:** `Meetings.tsx:96-99`, `Collections.tsx:88-98`

```tsx
const handleViewMeet = (meet: MeetType) => {
  console.log('Ver reunión:', meet);
  toast.info('Función de vista de detalles en desarrollo');  // ← visible al usuario
};
```

El usuario final ve un toast diciendo que la función está "en desarrollo". Esto es aceptable en staging, no en producción. Si el botón no está listo, debe estar deshabilitado o no renderizado.

---

### F-20 — 🔵 BAJO | Cobertura de tests: 0%

No existe ningún archivo de test en el proyecto. No hay configuración de Vitest, Jest, Testing Library ni Playwright/Cypress.

Para un sistema que maneja datos financieros (pagos, deudas, recibos), la ausencia total de tests es un riesgo operativo significativo. Al menos los flujos críticos deberían tener cobertura:
- Cálculo de totales de deuda/pago
- Lógica de autenticación / ProtectedRoute
- Formateo de moneda y fechas (usadas extensamente)

---

### F-21 — 🔵 BAJO | Accesibilidad

- Botones de acción en tablas (editar, eliminar, ver) usan solo íconos sin `aria-label`.
- Los modales no gestionan el foco (`focus trap`) al abrirse — un usuario de teclado puede "escapar" del modal.
- El `ClipLoader` tiene `aria-label='Loading Spinner'` en algunos lugares, ausente en otros.
- Tablas sin `<caption>` ni `scope` en headers.

---

### F-22 — 🔵 BAJO | Sin code splitting

**Archivo:** `src/main.tsx:11-15`

```tsx
import Neighbors from './pages/neighbors/Neighbors.tsx';
import Meetings from './pages/meetings/Meetings.tsx';
import Collections from './pages/collections/Collections.tsx';
import Measures from './pages/measures/Measures.tsx';
```

Todos los pages se importan estáticamente. El bundle inicial carga todo el código aunque el usuario solo visite una sección.

**Fix:**
```tsx
const Neighbors = React.lazy(() => import('./pages/neighbors/Neighbors'));
```

Con `<Suspense fallback={<LoadingScreen />}>` envolviendo las rutas.

---

### F-23 — 🔵 BAJO | Sin Error Boundaries

No existe ningún Error Boundary en la aplicación. Si un componente lanza una excepción no capturada (e.g., el crash de jsPDF de F-02), React desmonta todo el árbol y muestra una pantalla en blanco. El usuario no recibe ninguna información útil.

**Mínimo recomendado:**
```tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <BrowserRouter>...</BrowserRouter>
</ErrorBoundary>
```

---

## Detección Heurística de Código Generado por IA

Los siguientes patrones sugieren código generado/asistido por IA que fue aceptado sin revisión crítica:

1. **Interfaces duplicadas por archivo** — un LLM genera el contexto completo por componente sin pensar en reutilización cross-file.
2. **`require()` en módulo ESM** — mezcla de paradigmas CommonJS/ESM típica en código generado fuera de contexto del proyecto.
3. **`value='sergio.cardenas'` y `value={'123456'}` en Login** — placeholder de prueba que un LLM habría añadido "para conveniencia" y que debió removerse antes de commit.
4. **Constantes `PAYMENT_METHOD_LABELS` y `PAYMENT_METHOD_COLORS` definidas identicamente en dos archivos distintos** — un LLM no tiene visión cross-file.
5. **Comentarios en español mezclados con estructura en inglés** — señal de generación incremental por prompt.

**Riesgo asociado:** El código generado por IA tiende a ser plausible sintácticamente pero incorrecto semánticamente en contexto. Los bugs de F-02 y F-03 son ejemplos claros de esto.

---

## Análisis de Principios SOLID

| Principio | Estado | Nota |
|-----------|--------|------|
| **SRP** (Single Responsibility) | ❌ Violado | `CollectDebtPaymentsModal` (660 líneas) hace: form, listado, PDF, búsqueda, validación. `NeighborDetailModal` (680 líneas) hace: 4 tabs de datos con fetching propio. |
| **OCP** (Open/Closed) | ⚠️ Parcial | Los tipos de pago están como strings hardcodeados en múltiples lugares. Agregar uno requiere cambios en N sitios. |
| **LSP** | ✅ No aplica con claridad | No hay jerarquías de herencia que evaluar. |
| **ISP** (Interface Segregation) | ⚠️ Parcial | Props de tabla (`NeighborTable`) pasan callbacks que no siempre se usan. |
| **DIP** (Dependency Inversion) | ❌ Violado | Los componentes dependen directamente de `fetch()` y URLs concretas en lugar de abstracciones (`apiClient`). |

---

## Quick Wins (< 2h cada uno)

1. **F-01:** Eliminar `value='sergio.cardenas'` y `value={'123456'}` de `Login.tsx`. Rotar contraseña.
2. **F-05:** Reemplazar las 6 URLs `http://127.0.0.1:8000` con `${apiBase}` desde config.
3. **F-13:** Eliminar todos los `console.log` de datos de negocio.
4. **F-15:** Cambiar `/Reuniones` a `/reuniones` en `main.tsx` y en los links de navegación.
5. **F-16:** Cambiar `JSON.parse(config.production)` a `config.production === 'true'` en `config.ts`.
6. **F-17:** Eliminar el segundo bloque spinner redundante en `Measures.tsx`.
7. **F-04:** Agregar `credentials: 'include'` a todos los `fetch()` directos.
8. **F-08:** Implementar o eliminar `newPaymentModalForm.tsx`.

---

## Mejoras Estructurales (Sprints)

### Sprint 1 — Estabilización
- Centralizar todos los endpoints en `src/services/apiClient.ts`
- Centralizar todos los tipos en `src/types/domain.ts`
- Fix de F-02 (jsPDF): migrar a `@react-pdf/renderer` o instalar `jspdf` con import ESM
- Fix de F-03: mover parámetros de payment al body del POST
- Eliminar código muerto (DataTable, _NavbarApp, páginas comentadas)

### Sprint 2 — Arquitectura
- Migrar fetch directo en Neighbors/Meetings/Collections a custom domain hooks
- Refactorizar `CollectDebtPaymentsModal` en subcomponentes:
  - `PaymentForm` · `PaymentList` · `NeighborSearch` · `ReceiptGenerator`
- Aplicar patrón correcto de React Router (F-11)
- Error Boundaries

### Sprint 3 — Calidad
- Tests unitarios para lógica financiera (totales, formateo, validaciones)
- Tests de integración para flujos de auth
- Code splitting con React.lazy
- Reemplazar `window.confirm()` con modales consistentes en Meetings/Collections

---

## Estructura de Carpetas Recomendada

```
src/
├── components/
│   ├── common/          # ErrorBoundary, LoadingScreen, ConfirmModal
│   ├── forms/           # Formularios reutilizables
│   ├── modals/          # Solo orquestación de estado del modal
│   ├── tables/          # Componentes de tabla
│   └── navigation/
├── pages/               # Un directorio por página
├── hooks/               # Solo hooks genéricos (useFetchData, useDebounce)
├── services/            # apiClient.ts — punto único de requests HTTP
│   └── api/             # neighbors.ts, meetings.ts, collections.ts, measures.ts
├── types/               # domain.ts — todos los tipos de negocio
├── constants/           # PAYMENT_METHODS, STATUS_LABELS, STATUS_COLORS
├── utils/               # formatDate, formatCurrency, getFullName
└── config.ts            # solo re-export de env vars tipadas
```

---

## Veredicto Final

**Estado actual:** No apto para producción en entorno crítico sin atender F-01 a F-05.

**Fortalezas reales:**
- Routing y auth con cookies implementado correctamente en el login.
- UI/UX coherente con Material-Tailwind.
- `useFetchData` tiene la intención correcta aunque con bugs de implementación.
- Paginación en tablas de colecciones.
- `useMemo` para filtrado de vecinos en `CollectDebtPaymentsModal`.

**Deuda técnica prioritaria:**
1. Credenciales en código + rotarlas.
2. PDF con `require()` crashea el flujo de pago — el feature core no funciona.
3. Cookies de sesión no se envían → la app no autentica en producción.
4. URLs hardcodeadas apuntan a localhost en producción.

El codebase muestra señales claras de desarrollo iterativo rápido con asistencia de IA, donde cada componente fue construido de forma relativamente aislada sin aplicar convenciones transversales. El trabajo de unificación es manejable en 2-3 sprints enfocados.
