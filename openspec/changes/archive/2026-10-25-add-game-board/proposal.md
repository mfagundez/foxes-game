# Proposal

## Why

Foxes aún no tiene tablero: la página carga vacía. Todos los changes posteriores (restricciones, solución, victoria, timer, generación de puzzles) necesitan un tablero N×N con bloques de color en el que el jugador pueda colocar y quitar marcas, y un único punto de entrada de la definición del puzzle que el generador sustituirá sin tocar el tablero.

## What Changes

- El jugador ve un tablero 5×5 cuyas celdas muestran el color de su bloque.
- Cada celda tiene un estado independiente (vacía, césped, zorro). Cada activación avanza el ciclo vacía → césped → zorro → vacía. El estado inicial es vacío en todas las celdas.
- Las celdas se operan con clic, toque y teclado (Enter/Espacio) y su nombre accesible refleja posición, bloque y estado.
- El layout es responsive y sin scroll horizontal en escritorio y en móvil táctil.
- Sin persistencia: al recargar, el tablero vuelve al estado inicial.
- La definición del puzzle (tamaño N y asignación celda → bloque) pasa a ser un dato tipado con un único punto de carga. Se entrega un puzzle 5×5 fijo, **provisional**, que puede no ser resoluble.
- Un test unitario comprueba la integridad del fixture: tablero cuadrado, exactamente N bloques distintos y cada bloque contiguo por adyacencia ortogonal.

Fuera de alcance: restricciones del juego, comprobación de solución y victoria, timer, generación de puzzles, persistencia, refuerzo visual de bloques más allá del color y pruebas de N≠5.

## Capabilities

### New Capabilities

- `game-board`: tablero N×N de bloques de color con estado por celda (vacía, césped, zorro), interacción accesible por puntero, toque y teclado, y reinicio al recargar.

### Modified Capabilities

Ninguna. `openspec/specs/` está vacío.

## Impact

- Código nuevo bajo `src/` (módulos puros de definición y estado del tablero, y una capa de presentación fina), con sus pruebas Vitest, y una prueba Playwright bajo `tests/e2e/`.
- Se modifica `index.html` solo si hace falta para el contenedor ya existente; no se esperan otros cambios fuera de `src/` y `tests/`.
- Sin nuevas dependencias, sin cambios en herramientas ni en configuración de runners, sin persistencia.
