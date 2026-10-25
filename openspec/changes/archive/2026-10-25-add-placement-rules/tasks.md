# Tasks

## 1. Detección pura de conflictos (`placement-rule`)

- [x] 1.1 Crear `src/placement-rules.ts` con `findConflictingFoxes(board, blocks)` según D1 (requirements «Conflicto entre zorros por bloque / fila / columna / adyacencia», «Solo los zorros cuentan para el conflicto» y «Conflictos múltiples»); verificar con `npm run typecheck`.
- [x] 1.2 Añadir `src/placement-rules.test.ts` con Vitest: un escenario positivo y uno negativo por regla (bloque, fila, columna, adyacencia diagonal), césped ignorado, un zorro en varios conflictos, varios pares simultáneos con un zorro libre, tablero sin conflictos y `RangeError` por dimensiones; verificar con `npm run test -- src/placement-rules.test.ts`.

## 2. Resaltado diferido (`placement-rule`)

- [x] 2.1 Implementar el programador del resaltado sin DOM (D3), que solo programa y cancela un único resaltado pendiente, con la constante nombrada `CONFLICT_HIGHLIGHT_DELAY_MS = 1000` (requirements «Resaltado diferido tras la activación» y «Borrado del resaltado al activar»); verificar con `npm run typecheck`.
- [x] 2.2 Probar el programador con `vi.useFakeTimers()`: entrega a 1 s exactos y no antes, una nueva programación dentro del segundo cancela la anterior, varias activaciones rápidas entregan un solo resaltado, y `cancel()` sin nueva programación (corrección rápida: se crea un conflicto y se deshace antes de 1 s) no entrega nada; verificar con `npm run test` sobre su fichero.

## 3. Presentación: punto central, resaltado y nombre accesible (`placement-rule`, `game-board`)

- [x] 3.1 Extender `cellLabel` en `src/board-state.ts` para añadir «, en conflicto» a una celda con zorro en conflicto (requirement «Nombre accesible de la celda» de `game-board`) y cubrirlo en `src/board-state.test.ts` con y sin conflicto; verificar con `npm run test` sobre ese fichero.
- [x] 3.2 Refactorizar `src/main.ts` según D2: `renderAll()` único y `activate(row, column)` como punto central (avanzar estado, evaluar con `findConflictingFoxes`, borrar el resaltado, cancelar el pendiente, programar el resaltado diferido solo si hay conflictos y repintar), sustituyendo los `render()` por celda sin dejar la lógica anterior y sin implementar victoria; verificar con `npm run typecheck` y `npm run lint`.
- [x] 3.3 Conectar el resaltado diferido: al dispararse, marcar solo las celdas con zorro del resultado ya calculado con `data-conflict` y su nombre accesible (requirements «Resaltado de conflictos» y «Borrado del resaltado al activar»; «Nombre accesible de la celda» de `game-board`); verificar con las pruebas e2e de 4.1.
- [x] 3.4 Añadir en `src/style.css` la variable `--conflict` y el estilo de `.cell[data-conflict]` y de `.cell[data-conflict]:focus-visible` según D4 (requirement «Visibilidad del resaltado de conflicto»), sin alterar `.cell:focus-visible` fuera de la coincidencia; verificar con `npm run format:check` y `npm run lint`.

## 4. Pruebas de navegador

- [x] 4.1 Añadir `tests/e2e/placement.spec.ts` (Chromium, `page.clock.install()` y `fastForward`, fixture existente de warnings): sin resaltado antes de 1 s y con resaltado a 1 s; cancelación del resaltado pendiente por una activación dentro del segundo y un solo resaltado tras activaciones rápidas; corrección rápida (crear y deshacer un conflicto en menos de 1 s: nunca se muestra resaltado); borrado inmediato al activar con resaltado visible y reaparición solo tras otro segundo; quitar un zorro (sin conflictos restantes y con conflictos restantes); resaltado solo de las celdas implicadas; sin conflictos no hay resaltado; activación por clic y por Enter/Espacio; nombre accesible con y sin «, en conflicto»; verificar con `npm run test:e2e`.
- [x] 4.2 Ejecutar el gate de código por la vía oficial: `npm run check` y `npm run test:e2e` sin fallos ni warnings (incluye `openspec validate --all --strict`).

## 5. QA humana (contra `npm run dev`, detenido al terminar)

- [x] 5.1 QA humana de escritorio: el borde rojo es claramente visible sobre cada uno de los cinco colores de la paleta; solo se resaltan las celdas implicadas; el retardo de 1 s y el reinicio se perciben correctamente. Requiere confirmación humana explícita.
- [x] 5.2 QA humana de foco: con Tab hasta una celda en conflicto se distinguen a la vez el borde rojo y el indicador de foco. Requiere confirmación humana explícita.
- [x] 5.3 QA humana en móvil táctil (320 px): el toque activa y el resaltado aparece 1 s después de la última activación, sin scroll horizontal. Requiere confirmación humana explícita.
