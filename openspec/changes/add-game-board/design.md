# Design

## Context

El repositorio solo tiene el bootstrap del toolchain: `index.html` con el contenedor `#app` y un `src/main.ts` vacío. No hay specs permanentes. La arquitectura declarada separa lógica pura (Vitest) y presentación fina (Playwright y QA humana). Motivación y alcance: ver `proposal.md`; requisitos: ver `specs/game-board/spec.md`.

## Goals / Non-Goals

**Goals:**
- Módulos puros, sin DOM, para la definición del puzzle y el estado del tablero.
- Un único punto de carga de la definición, que el futuro generador sustituirá sin tocar el tablero ni el estado.
- Presentación fina: renderiza la definición y el estado, y delega en la lógica pura.

**Non-Goals:**
- Restricciones, solución, victoria, timer, generación y persistencia.
- Validación de la definición en runtime (solo test unitario).
- Soporte probado de N≠5: el código deriva N, pero no se prueba.
- Bordes, patrones u otro refuerzo visual de los bloques.

## Decisions

**D1. Definición como dato tipado en módulo propio.** `PuzzleDefinition` = `{ blocks: number[][] }`, con `blocks[row][column]` ∈ 1..N y N = `blocks.length`. Un único módulo expone `loadPuzzle(): PuzzleDefinition` y devuelve el puzzle fijo provisional. Alternativa: guardar además un campo `size`; se descarta porque duplica información que ya contiene `blocks.length` y podría contradecirla. Las filas de longitud distinta de N las detecta el test de integridad.

**D2. Puzzle provisional 5×5** (puede no ser resoluble; lo sustituirá el generador):

```
1 1 1 2 2
1 3 3 2 2
4 3 3 2 5
4 4 3 5 5
4 4 5 5 5
```

Cinco bloques, todos contiguos por adyacencia ortogonal. Lo elegí yo; el test de integridad lo valida.

**D3. Estado en módulo puro e inmutable.** El estado es una matriz N×N de `'empty' | 'grass' | 'fox'`. Funciones puras: crear el estado inicial desde un tamaño, y avanzar una celda `(row, column)` devolviendo un estado nuevo sin tocar el resto. El ciclo se define una sola vez como función `nextCellState(state)`. Alternativa: mutar en sitio, descartada por facilitar las pruebas y los changes posteriores que comparan estados.

**D4. Etiquetas en módulo puro.** El nombre accesible se construye con una función pura `(row, column, block, state) → string`, con los tokens vacía, césped, zorro y numeración desde 1. Así queda cubierto por Vitest y la capa DOM solo lo asigna.

**D5. Presentación.** `main.ts` carga la definición, crea el estado y monta el DOM en `#app`. Cada celda es un `<button type="button">` con `aria-label` igual al nombre accesible; el emoji va en un hijo `aria-hidden` para que el nombre accesible sea únicamente el `aria-label`. Cada activación llama a la función pura, sustituye el estado y re-renderiza la celda afectada (basta actualizar su texto y su `aria-label`). Los botones nativos dan clic, toque, Enter, Espacio y foco por Tab sin código adicional. Sin framework de UI, según el stack.

**D6. Estructura semántica.** El tablero es `div role="group" aria-label="Tablero"` y cada fila `div role="group" aria-label="Fila R"`. Se evita `role="grid"` porque promete navegación con flechas que este change no implementa. Es decisión mía; permite a Playwright localizar las 5 filas por rol sin depender del layout.

**D7. Paleta y estilos.** Cinco colores de fondo pastel (valores concretos en la implementación) como variables CSS indexadas por número de bloque, con contraste suficiente para 🌱 y 🦊 y distinguibles entre sí. La paleta cubre N≤5; N>5 queda fuera de alcance. Las celdas usan un tamaño fluido (`min()` sobre el ancho de la ventana) con cuadrícula CSS de N columnas fijadas por una variable que fija el código desde N (`blocks.length`); el ancho mínimo objetivo es 320 px y el tamaño táctil de celda no baja de 44 px. Los 44 px y los 320 px son decisión mía; 5×44 px cabe en 320 px con holgura.

**D8. Foco visible.** Se conserva (o define explícitamente) un `:focus-visible` con contorno claro; los colores pastel no deben ocultarlo.

**D9. Sin persistencia.** No se usa `localStorage`, `sessionStorage`, cookies ni URL; el estado vive solo en memoria.

**D10. Estrategia de pruebas.**
- Vitest, puro: integridad del fixture (todas las filas con longitud N, N bloques distintos 1..N, contigüidad ortogonal por búsqueda de componentes conexas); ciclo de estado, independencia entre celdas e inmutabilidad; etiquetas.
- Playwright (project `chromium` existente, sin projects nuevos) con el fixture de `tests/e2e/fixtures.ts` y localizadores por rol y nombre accesible: carga (25 botones en 5 filas, todos «…: vacía»), ciclo con clic, con Enter y con Espacio, independencia, recarga. El comportamiento táctil y responsive usa opciones por test (`viewport` de 320 px y `hasTouch`, activación con `tap`) y la comprobación de que no hay scroll horizontal (`scrollWidth <= clientWidth`).
- El color por bloque: una función pura asigna a cada bloque un índice de paleta distinto y estable, y Vitest comprueba que bloques iguales comparten índice y bloques distintos no. El aspecto real (distinción y legibilidad) queda para QA humana; Playwright no compara colores.

## Risks / Trade-offs

- [Puzzle provisional no resoluble] → Declarado en la propuesta y en este diseño; el generador lo sustituirá por el punto de carga único.
- [Contraste y distinción de colores no verificables por localizador] → QA humana en escritorio y táctil.
- [Re-render por celda sin framework] → Aceptable a 25 celdas; si changes posteriores necesitan más, se revisa entonces.
- [Estado inmutable crea una matriz nueva por activación] → Coste despreciable a 5×5.
