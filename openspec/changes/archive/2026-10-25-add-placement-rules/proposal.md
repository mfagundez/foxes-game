## Why

El tablero ya permite marcar celdas como vacía, césped o zorro, pero no aplica ninguna regla: el jugador puede dejar zorros que se «ven» entre sí sin ningún aviso. Para que el juego sea jugable hay que definir qué colocaciones de zorros son inválidas y avisar al jugador sin interrumpir su ritmo de colocación.

## What Changes

- Nueva capability `placement-rule`: dos celdas con zorro están en conflicto si pertenecen al mismo bloque de color, están en la misma fila, en la misma columna o son adyacentes (8 vecinas, diagonal incluida).
- Evaluación inmediata y resaltado diferido: cualquier activación de celda (clic, toque, Enter, Espacio; cualquier transición, incluida la que quita un zorro) evalúa el tablero en el momento, borra de inmediato el resaltado visible y cancela el resaltado pendiente; si hay conflictos, programa su resaltado 1 s después. Una nueva activación antes de que se muestre lo cancela y repite el proceso (el resaltado aparece 1 s después de la última activación si en ese momento hay conflictos).
- Resaltado en rojo solo de las celdas con zorro que participan en al menos un conflicto; sin conflictos no se resalta nada. Una nueva activación borra el resaltado de inmediato.
- El borde de conflicto es claramente visible sobre los cinco colores de la paleta y distinguible del indicador de foco, incluso cuando coinciden en la misma celda.
- Se modifica el requirement «Nombre accesible de la celda» de `game-board`: una celda resaltada se nombra «fila R, columna C, bloque B: zorro, en conflicto».
- La detección de conflictos es una función pura independiente del DOM; el temporizador y el resaltado pertenecen a la capa de presentación. El retardo del resaltado es una constante con nombre (`CONFLICT_HIGHLIGHT_DELAY_MS`), sin configuración persistida.
- Sin cambios **BREAKING**: el ciclo de estados y los métodos de activación no cambian.

## Capabilities

### New Capabilities
- `placement-rule`: reglas de colocación de zorros (qué es un conflicto), evaluación inmediata en cada activación y resaltado diferido 1 s de las celdas con zorro en conflicto.

### Modified Capabilities
- `game-board`: el requirement «Nombre accesible de la celda» incorpora el sufijo «, en conflicto» mientras la celda esté resaltada.

## Impact

- `src/placement-rules.ts` (nuevo): función pura de detección, con pruebas Vitest.
- `src/main.ts`: punto central post-activación, temporizador del resaltado y estado de resaltado; `src/board-state.ts`: `cellLabel` admite el estado de conflicto; `src/style.css`: estilo de conflicto y su convivencia con `.cell:focus-visible`.
- `tests/e2e/`: nuevos tests Playwright (Chromium) con reloj controlado.
- Sin dependencias nuevas, sin persistencia, sin configuración persistida.
- Fuera de alcance: victoria y comprobación de N zorros, timer de partida, generación de puzzles, resolubilidad del puzzle provisional, persistencia y cambios en el ciclo de estados o en los métodos de activación.
