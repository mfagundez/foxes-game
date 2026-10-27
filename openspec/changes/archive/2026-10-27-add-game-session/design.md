# Design

## Context

Estado actual (ver `proposal.md` para la motivación):

- `src/main.ts` monta el tablero y, en cada activación, avanza la celda, evalúa `findConflictingFoxes(board, puzzle.blocks)` y programa el resaltado diferido (1 s) con `createHighlightScheduler`. Ese es el punto de enganche de la victoria.
- La lógica de juego vive en módulos puros (`board-state.ts`, `placement-rules.ts`, `highlight-scheduler.ts`, `puzzle.ts`) con Vitest; `main.ts` es una capa de presentación fina.
- Los e2e existentes usan `page.clock.install` / `pauseAt` / `runFor`, que controlan `Date.now`, `performance.now`, `setTimeout` y `setInterval`.
- El nombre accesible de las celdas lo construye `cellLabel` y lo fijan las specs `game-board`.
- Verificado con un recorrido exhaustivo: el puzzle fijo actual tiene 4 soluciones válidas (columnas por fila, base 0: `[1,3,0,2,4]`, `[1,4,2,0,3]`, `[2,4,1,3,0]`, `[3,0,2,4,1]`). Sirve para el e2e de victoria y confirma que la victoria por reglas admite varias.

## Goals / Non-Goals

**Goals:**
- Lógica de victoria, formateo mm:ss y cronómetro en módulos puros, sin DOM, con fuente de tiempo inyectable.
- Cambios en `main.ts` limitados a cablear: cronómetro visible, evaluación de victoria por activación, bloqueo, mensaje y anuncio.

**Non-Goals:**
- Unicidad de la solución, reinicio, pausa, récords, persistencia y animaciones (fuera de alcance del encargo).
- Tocar las reglas de conflicto o el resaltado diferido de `placement-rule`.

## Decisions

### D1. Victoria como función pura sobre las reglas existentes
Módulo `src/victory.ts` con `isVictory(board, blocks): boolean`: cuenta los zorros, exige que sean exactamente `blocks.length` y que `findConflictingFoxes` devuelva vacío. Reutiliza la detección de conflictos sin duplicar reglas y hereda su `RangeError` por dimensiones inconsistentes.
- Alternativa: comparar con una solución almacenada. Descartada (decisión cerrada): rechazaría disposiciones válidas y acopla la partida a un puzzle concreto.
- Alternativa: incluir la victoria en `placement-rules.ts`. Descartada: ese módulo responde a «¿qué zorros chocan?»; la victoria es un concepto de partida.

### D2. Formato mm:ss en función pura
`src/elapsed-format.ts` con `formatElapsed(ms: number): string`: segundos totales = `Math.floor(ms / 1000)`, minutos = `Math.floor(total / 60)` con `padStart(2, "0")` (sin tope), segundos = `total % 60` con dos dígitos. Entradas negativas o no finitas lanzan `RangeError`, coherente con el resto de módulos. Casos límite en Vitest: 0, 999, 1000, 59 999, 60 000, 599 999, 600 000, 3 599 999, 3 600 000, 4 503 000 (75:03), 6 000 000 (100:00).

### D3. Fuente de tiempo inyectable y cronómetro puro
`src/stopwatch.ts`: `type Clock = () => number` y `createStopwatch(clock)`, que fija `startedAt = clock()` al crearse y expone `elapsedMs()`, `stop()` y `isStopped()`. `stop()` lee el reloj una sola vez, congela ese valor y es idempotente; tras parar, `elapsedMs()` devuelve siempre el valor congelado. Así el cronómetro y el mensaje usan literalmente el mismo número.
- Reloj de producción: `() => Date.now()` (lectura diferida, no se captura la referencia). Mide tiempo real incluso con la pestaña oculta, porque el tiempo se calcula por diferencia de reloj y no contando ticks.
- Alternativa: `performance.now()`. Monótono e inmune a cambios del reloj del sistema, pero en algunas plataformas no avanza durante la suspensión del equipo; «tiempo real transcurrido» favorece `Date.now()`. Trade-off: un ajuste manual del reloj del sistema durante la partida distorsionaría el tiempo (aceptado en un juego sin récords).
- Alternativa: contar ticks de `setInterval`. Descartada: el navegador los limita en pestañas ocultas y acumularía deriva.
- Pruebas: Vitest inyecta un reloj falso (función con valor mutable); Playwright usa `page.clock`, que sustituye `Date.now` y `setInterval`, sin ninguna API específica de test en producción.

### D4. Refresco visual por intervalo, valor siempre derivado del reloj
`main.ts` programa un `setInterval` corto (≈250 ms) que repinta `formatElapsed(stopwatch.elapsedMs())`; además repinta en el instante de la victoria. El intervalo solo decide cuándo se refresca el texto, nunca cuánto tiempo ha pasado, así que un intervalo retrasado en segundo plano no afecta a la medida y al volver se muestra el valor correcto en el siguiente tick. Al ganar se cancela el intervalo. 
- Alternativa: `requestAnimationFrame`. Descartada: se pausa en pestañas ocultas y consume más sin necesidad.
- Alternativa: un `setTimeout` alineado al siguiente segundo. Más preciso en el cambio de dígito, pero más complejo; 250 ms ofrece un desfase visual máximo imperceptible.

### D5. Orden de operaciones en la activación
En `activate`: si la partida está ganada, retornar sin hacer nada (guarda única, común a clic/toque/Enter/Espacio, que en un `<button>` nativo llegan todos como `click`). Si no, avanzar la celda y evaluar. Si `isVictory`: `stopwatch.stop()`, cancelar el scheduler y limpiar el resaltado, repintar el cronómetro, mostrar el mensaje y anunciar. Si no: lógica actual de conflictos. La victoria no espera al retardo de 1 s; por construcción no hay conflictos al ganar, así que no queda resaltado pendiente.
- Estado de partida: una variable local `won` en `mountBoard` (o derivada de `stopwatch.isStopped()`), sin módulo de estado adicional: es un único booleano con un único consumidor.

### D6. Bloqueo en el plano de accesibilidad
Elección: `aria-disabled="true"` en cada celda más la guarda de D5. Las celdas siguen siendo botones enfocables, con el mismo `aria-label`; los lectores de pantalla las anuncian como «no disponible/atenuado» y el jugador puede recorrer el tablero final con Tab y revisar cada estado.
- Alternativa `disabled`: se elimina del orden de tabulación y del árbol de enfoque; el botón enfocado al ganar pierde el foco (el foco salta al `body`, desorienta a quien usa teclado) y el estilo por defecto atenúa los colores, degradando el contraste del tablero que debe seguir legible. Además, en algunos lectores el nombre se anuncia distinto.
- Alternativa `inert` sobre el tablero: aísla del árbol de accesibilidad y de los eventos; sencillo y robusto, pero impide revisar el resultado con lector de pantalla o teclado, y contradice la intención de que el tablero siga visible y consultable.
- Alternativa solo guarda en el manejador (sin atributo): cumple el comportamiento pero no comunica el bloqueo a tecnologías de apoyo.
- El nombre accesible de las celdas no cambia (decisión cerrada); `aria-disabled` aporta el estado sin tocar el nombre. Estilo: `cursor: default` en las celdas bloqueadas, sin atenuar colores.
- Efecto en `game-board`: el delta fija que las celdas siguen pudiendo recibir foco; es coherente con esta elección y la restringe (excluye `disabled` e `inert`).

### D7. Anuncio y mensaje: región viva persistente + capa visual
- Región viva `role="status"` (que ya implica una región educada, sin añadir `aria-live` aparte; visualmente oculta) presente en el DOM desde la carga y vacía; al ganar se rellena con «¡Victoria! Tiempo empleado: mm:ss». Una región que ya existe antes del cambio se anuncia de forma fiable; una insertada ya con contenido, no siempre.
- Capa visual del mensaje: elemento superpuesto al tablero (`position: absolute` sobre un contenedor del tablero), con `aria-hidden="true"` para no duplicar el anuncio, un panel centrado con fondo blanco al 92 % detrás del texto («¡Victoria!» y debajo el tiempo), sin velo sobre todo el tablero, que queda visible alrededor del panel; `pointer-events: none` para que los clics lleguen a las celdas (y se compruebe de verdad la guarda de D5) y contraste de texto suficiente sobre los cinco colores. Aparece sin animaciones.
- Alternativa: una única capa que sea a la vez visible y región viva. Más simple, pero depende de que el lector anuncie contenido de una capa que pasa de oculta a visible; se descarta por fiabilidad.
- Cronómetro: `role="timer"` (implícitamente `aria-live="off"`), de modo que su avance no se anuncia; solo la victoria lo hace.

### D8. Layout: contenedor del juego
Un contenedor `.game` (relative) con el ancho actual del tablero (`min(100% - 2rem, size * 5rem)`, que hoy tiene `.board`) agrupa, en columna, el cronómetro (alineado a la derecha, tamaño discreto, cifras tabulares `font-variant-numeric: tabular-nums` para evitar saltos de ancho) y el tablero; la capa del mensaje se posiciona sobre el tablero dentro del contenedor. El cronómetro comparte el ancho del tablero, así que no introduce scroll horizontal a 320 px. Valor `size * 5rem` se mantiene; se mueve de `.board` a `.game`.

### D9. Organización de módulos y retirada de lógica sustituida
Módulos nuevos: `victory.ts`, `elapsed-format.ts`, `stopwatch.ts` (+ tests). No se retira lógica existente: nada queda sustituido salvo el ajuste de ancho de `.board` a `.game`. El comentario de `puzzle.ts` («may not be solvable») queda obsoleto, porque el puzzle provisional tiene 4 soluciones válidas; su corrección entra en este change como cambio solo de comentario, sin efecto en el comportamiento (tarea 2.4): pasa a indicar que hay varias soluciones válidas y que la unicidad la garantizará el futuro generador de puzzles.

### D10. Estrategia de pruebas por capas
- Vitest: `victory.test.ts` (N zorros sin conflicto; N zorros con conflicto; N-1; N+1; césped y vacías no bloquean; las 4 soluciones del puzzle fijo; dimensiones inconsistentes), `elapsed-format.test.ts` (casos límite de D2 y errores), `stopwatch.test.ts` (reloj falso: avance, truncado desde el consumidor, parada congelada, `stop` idempotente, el valor tras parar no depende del reloj).
- Playwright (Chromium, `page.clock`): cronómetro en 00:00 y avance con `runFor`; formato a 9:59, 10:00, 60:00+ y 100:00 con `fastForward` o `setFixedTime`/`runFor`; victoria con una de las 4 soluciones; no victoria con N zorros en conflicto y con N-1; parada del cronómetro y coincidencia con el mensaje; sin respuesta a clic, Enter y Espacio (y toque con contexto `hasTouch`); región viva con el texto esperado; nombre accesible inalterado y `aria-disabled`; recarga que reinicia. Se respeta la política `browser-warning` (sin `console.warn/error`).
- QA humana proporcional (tarea separada): aspecto y posición del cronómetro, legibilidad del mensaje sobre el tablero, uso en móvil y escritorio, y, si es posible, escucha con un lector de pantalla.

## Risks / Trade-offs

- [Los e2e existentes pueden alcanzar una victoria involuntaria y bloquear el tablero] → Revisar `placement.spec.ts`, `board.spec.ts` y `smoke.spec.ts` al implementar; ninguno debería colocar 5 zorros sin conflicto, y se ajusta cualquier caso afectado.
- [`setInterval` fijo y reloj de Playwright pausado: el cronómetro no avanza en los tests existentes que usan `pauseAt`] → Es el comportamiento esperado (el tiempo está congelado); los tests de cronómetro avanzan el reloj explícitamente.
- [Cambio del reloj del sistema durante la partida altera el tiempo] → Aceptado (D3); juego sin récords ni persistencia.
- [Capa del mensaje con `pointer-events: none` deja ver las celdas bajo el texto] → Intencionado; las celdas ya no responden y el contraste del texto se asegura con el panel de fondo blanco al 92 %.
- [Anuncio no probable en Playwright] → Se verifica el contenido de la región viva; el comportamiento real con lector de pantalla queda en QA humana.

## Open Questions

Ninguna.
