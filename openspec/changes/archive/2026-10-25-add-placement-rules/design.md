# Design

## Context

Estado actual (ver `proposal.md` para la motivación):

- `src/board-state.ts` contiene la lógica pura del tablero (`BoardState`, `advanceCell`, `cellLabel`). Los bloques no forman parte de `BoardState`: viven en `PuzzleDefinition.blocks` (`src/puzzle.ts`, matriz con el número de bloque 1..N de cada celda; hoy un puzzle provisional).
- `src/main.ts` es una capa fina: `mountBoard` crea los botones y cada uno tiene un `render()` local y un `click` que avanza el estado. No existe un punto central posterior a la activación. Enter y Espacio activan el `<button>` de forma nativa mediante `click`, por lo que clic, toque y teclado convergen en el mismo handler.
- `.cell:focus-visible` dibuja un `outline` de 3 px (`--focus`, azul oscuro `#1a237e`) con `outline-offset: -3px`, es decir, sobre los 3 px interiores del borde de la celda. Las celdas tienen `border: 1px` y fondo de la paleta (`--palette-0..4`).
- Las pruebas e2e usan una fixture que falla ante `console.warn`/`console.error`/`pageerror`.

## Goals / Non-Goals

**Goals:**
- Detección de conflictos pura, determinista y probada sin DOM.
- Un único punto en `main.ts` por el que pasa toda activación, sin duplicar lógica por celda.
- Evaluación inmediata en cada activación y temporizador con un único resaltado pendiente como máximo, con cancelación explícita.
- Señal de conflicto distinguible del foco y no dependiente solo del color.

**Non-Goals:**
- No se añade configuración persistida ni ajustable del retardo.
- No se toca el ciclo de estados ni los métodos de activación.
- No se evalúa victoria ni cuenta de N zorros; no se cambia el puzzle provisional.

## Decisions

### D1. Detección en un módulo puro nuevo `src/placement-rules.ts`

Contrato:

```ts
export interface CellPosition { readonly row: number; readonly column: number } // 0-based
export function findConflictingFoxes(
  board: BoardState,
  blocks: readonly (readonly number[])[],
): readonly CellPosition[];
```

- Devuelve, sin duplicados y en orden de fila y columna, las celdas con zorro que participan en al menos un conflicto (mismo bloque, misma fila, misma columna o vecina de las 8 direcciones respecto a otro zorro). Lista vacía si no hay conflictos. Ignora vacías y césped.
- Función pura: no muta sus argumentos, no usa DOM ni temporizadores. Lanza `RangeError` si `blocks` y `board` no tienen las mismas dimensiones (coherente con `cellStateAt`).
- Implementación prevista: recoger los zorros y comparar por pares (N ≤ 5, coste irrelevante).

Alternativas:
- *Añadirla a `board-state.ts`*: evita un fichero, pero mezcla estado del tablero con reglas y obliga a cargar los bloques ahí; el módulo propio sigue la separación «un módulo puro por responsabilidad» y permite a la futura victoria reutilizarlo.
- *Meter los bloques en `BoardState`*: cambiaría un contrato estable sin necesidad; se pasan como parámetro.
- *Devolver un booleano por celda (matriz)*: más cómodo de pintar, pero la lista es más fácil de probar y de convertir en `Set` clave `row,column` en la presentación.

### D2. Punto central post-activación en `main.ts`

`mountBoard` guarda las referencias de los botones y su contenido en una matriz y sustituye los `render()` por celda por un único `renderAll()`. Cada `click` solo llama a `activate(row, column)`, que, en este orden: (1) avanza el estado con `advanceCell`, (2) evalúa el tablero resultante con `findConflictingFoxes(board, puzzle.blocks)`, (3) vacía el conjunto de celdas resaltadas, (4) cancela el resaltado pendiente, (5) si la evaluación devolvió conflictos, programa el resaltado diferido de ese resultado (D3) y (6) llama a `renderAll()`. Como clic, toque, Enter y Espacio llegan por `click`, todas las vías pasan por `activate` sin lógica por celda. `renderAll()` recalcula contenido, `aria-label` (con `cellLabel`) y el atributo de conflicto de las 25 celdas a partir de `board` y del conjunto de celdas resaltadas, de modo que el sufijo accesible y el estilo no pueden desincronizarse.

El resultado de la evaluación inmediata en `activate()` es el punto donde un change posterior podrá detectar la victoria (tablero con N zorros y sin conflictos). Eso no se implementa aquí: victoria y timer de partida siguen fuera de alcance.

Alternativas: delegar un único listener en el contenedor (más cambio de DOM para el mismo efecto) o observar mutaciones (indirecto y frágil). Se descarta renderizar solo la celda activada porque el borrado del resaltado afecta a otras celdas.

### D3. Temporizador del resaltado diferido

- La evaluación es síncrona (D2); el temporizador solo difiere la visualización de un resultado ya calculado. Constante con nombre `CONFLICT_HIGHLIGHT_DELAY_MS = 1000` en `main.ts`, sin configuración persistida (decisión cerrada; el proyecto declara persistencia nula).
- Un único resaltado pendiente como máximo: `let pendingHighlight: number | undefined`. El helper se limita a programar y cancelar ese resaltado: `schedule(positions)` cancela el pendiente (si existe) y programa un `setTimeout` que, al dispararse, limpia el handle y entrega las posiciones ya calculadas para que se pinten; `cancel()` limpia el pendiente. `activate()` siempre llama a `cancel()` y solo llama a `schedule()` si hay conflictos, de modo que la corrección rápida (crear y deshacer un conflicto en menos de 1 s) no llega a mostrar nada.
- Se usa `setTimeout` global del navegador (no `Date.now` ni `requestAnimationFrame`) para que `page.clock` de Playwright y `vi.useFakeTimers()` de Vitest lo controlen.
- El helper vive en un módulo sin DOM, con callback inyectado (por ejemplo `createHighlightScheduler(delayMs, show)`), para probarlo con temporizadores simulados; `main.ts` lo conecta y se mantiene fino. La forma exacta se decide en apply.
- No hay `cancel` al desmontar porque el tablero vive toda la sesión de la página.

Alternativas descartadas: diferir la evaluación (modelo anterior; mezclaría cálculo y presentación y evaluaría con un estado que el jugador ya pudo cambiar) y resaltar sin retardo en cada activación (provocaría parpadeos mientras el jugador coloca).

### D4. Estilo visual del conflicto frente al foco

Se marca la celda con un atributo `data-conflict` (selector de CSS, sin depender de clases de estado). Estilo del conflicto: `border-color` rojo oscuro y un anillo interior `box-shadow: inset 0 0 0 4px var(--conflict)` (rojo oscuro, p. ej. `#b71c1c`, definido como variable CSS junto a `--focus`). Se dibuja como borde propio de la celda, no con `outline`, para no competir con el `outline` del foco. Cuando coinciden (`.cell[data-conflict]:focus-visible`), el foco conserva su `outline` de 3 px pero con `outline-offset` mayor (-7px) para que quede dentro del anillo rojo: rojo en los 4 px exteriores y azul oscuro en los 3 px siguientes, ambos visibles a la vez.

Alternativas:
- *`outline` rojo*: colisiona con el foco (mismo mecanismo y misma posición) y lo pisaría o sería pisado.
- *`border` más grueso*: cambia el tamaño de la celda y puede desplazar el layout; la celda ya tiene `box-sizing` por defecto de `button` y 44 px mínimos.
- *Cambiar el fondo o solo el color*: no es un «borde rojo», y el rojo sobre la paleta rosa (`--palette-0`) se confunde; el borde oscuro y grueso mantiene contraste en las cinco.
- *Parpadeo/animación*: peor accesibilidad (movimiento reducido) y no pedido.

El conflicto no se expone solo con color: el sufijo «, en conflicto» del nombre accesible (decisión cerrada) cubre a usuarios de lector de pantalla y de daltonismo.

### D5. Estrategia de pruebas por capas

- Vitest: tabla de casos de `findConflictingFoxes` (un caso positivo y uno negativo por regla, conflicto múltiple, césped ignorado, `RangeError`); `cellLabel` con y sin conflicto; programador del resaltado con `vi.useFakeTimers()` (1 s exactos y no antes, cancelación por una nueva activación, un solo resaltado tras varias activaciones, corrección rápida sin resaltado).
- Playwright (Chromium) con `page.clock.install()` y `page.clock.fastForward()`: flujo visible (retardo, cancelación, corrección rápida, borrado inmediato, quitar un zorro), nombre accesible y atributo de conflicto, para clic y teclado.
- QA humana proporcional: visibilidad del borde sobre los cinco colores, convivencia con el foco, móvil táctil.

## Risks / Trade-offs

- [El rojo oscuro puede confundirse con la paleta rosa en pantallas de poco contraste] → anillo grueso y oscuro; verificación en QA humana sobre cada color.
- [Desfase entre estilo y nombre accesible] → ambos derivan de un único `renderAll()` a partir del mismo conjunto de conflictos.
- [Pruebas e2e frágiles con tiempo real] → reloj controlado de Playwright, sin `waitForTimeout`.
- [`outline-offset` -7px en celdas de 44 px reduce el área interior] → solo se aplica en la coincidencia conflicto + foco; el contenido (emoji) queda centrado y no se tapa.
- Refactor de `main.ts` (render por celda → `renderAll`): reemplaza la lógica anterior en el mismo change, sin conservar ramas antiguas. Sin ruptura de compatibilidad, datos ni migración: el proyecto es greenfield sin persistencia.

## Open Questions

- Forma exacta del programador del resaltado (módulo y firma): se concreta en apply sin cambiar specs ni tareas.
