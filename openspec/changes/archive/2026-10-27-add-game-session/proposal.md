# Proposal

## Why

Hoy Foxes permite colocar zorros y señala conflictos, pero la partida no tiene principio ni fin: no hay cronómetro, no se detecta cuándo el jugador ha resuelto el tablero y nada le comunica que ha ganado. El tablero ya se evalúa en cada activación (`placement-rule`), que es el punto natural de enganche para cerrar el ciclo de partida.

## What Changes

- Nueva capability `game-session`: una partida arranca al cargar la página con un cronómetro visible (mm:ss, encima del tablero y alineado a la derecha), termina cuando el tablero contiene N zorros sin ningún conflicto y, entonces, detiene el cronómetro, bloquea el tablero y superpone el mensaje «¡Victoria!» con el tiempo empleado.
- La victoria se decide por reglas (N zorros y ningún conflicto según `placement-rule`), no por comparación con una solución guardada; cualquier disposición válida gana.
- La victoria y el tiempo se anuncian a lectores de pantalla.
- `game-board` se modifica para que, tras la victoria, las celdas dejen de ser activables por clic, toque, Enter y Espacio y su estado quede congelado.
- Sin reinicio ni persistencia: recargar la página empieza otra partida en 00:00 con el tablero vacío.
- No hay cambios en las reglas de conflicto ni en el resaltado diferido de `placement-rule`, ni en el puzzle fijo.

## Capabilities

### New Capabilities
- `game-session`: inicio de partida, cronómetro, condición de victoria y fin de partida (bloqueo del tablero, mensaje de victoria y anuncio accesible).

### Modified Capabilities
- `game-board`: el requirement «Activación de la celda» pasa a contemplar que, tras la victoria, ningún método de activación cambia el estado de las celdas.

## Impact

- Código nuevo: módulos puros sin DOM para la evaluación de victoria, el formateo mm:ss y el cronómetro con fuente de tiempo inyectable; pruebas Vitest asociadas.
- Código modificado: `src/main.ts` (montaje del cronómetro, evaluación de victoria en cada activación, bloqueo y mensaje), `src/style.css` (cronómetro y capa de mensaje), `index.html` solo si hiciera falta, y `src/puzzle.ts` solo en un comentario (el del puzzle provisional, obsoleto), sin efecto en el comportamiento.
- Pruebas: nuevo spec Playwright con reloj controlado; revisión de los e2e existentes por si alguno alcanza una victoria involuntaria.
- Dependencias, configuración, persistencia y gobierno: sin cambios.
