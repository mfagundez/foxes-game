# Foxes

Juego de navegador basado en una matriz 5x5. Las reglas de juego se especifican change a change con OpenSpec (`openspec/`).

Stack: TypeScript (strict) + Vite, Vitest, Playwright (Chromium), ESLint y Prettier. Node ^26 y npm.

## Estado del juego

Tablero N×N (hoy 5×5, puzzle fijo provisional) dividido en N bloques de color. Cada celda avanza con clic, toque, Enter o Espacio: vacía → césped 🌱 → zorro 🦊 → vacía.

Reglas de colocación: no puede haber dos zorros en el mismo bloque, fila o columna, ni adyacentes (diagonal incluida). El tablero se evalúa en cada activación; si hay conflictos, las celdas con zorro implicadas se resaltan en rojo 1 s después de la última activación, y una nueva activación borra el resaltado al momento. El conflicto también se expone en el nombre accesible de la celda.

Partida: al cargar la página arranca un cronómetro (mm:ss, encima del tablero a la derecha) que mide tiempo real, sin pausa. Se gana al tener N zorros sin ningún conflicto; cualquier disposición válida cuenta. Al ganar, el cronómetro se detiene, el tablero deja de responder y se superpone «¡Victoria!» con el tiempo empleado, que también se anuncia a lectores de pantalla. Para jugar otra vez se recarga la página.

Pendiente: generación de puzzles. El puzzle provisional tiene varias soluciones válidas; la unicidad llegará con el generador.

La fuente normativa del comportamiento son las specs en `openspec/specs/` (`game-board`, `placement-rule`, `game-session`).

## Inicio rápido

```sh
nvm use                          # Node 26 (.nvmrc)
npm install
npx playwright install chromium  # una sola vez, lo ejecuta el responsable técnico
```

| Comando                | Descripción                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR                                          |
| `npm run build`        | Build de producción                                                     |
| `npm run preview`      | Sirve el build de producción                                            |
| `npm run typecheck`    | `tsc --noEmit`                                                          |
| `npm run lint`         | ESLint con `--max-warnings=0`                                           |
| `npm run format:check` | Prettier en modo check                                                  |
| `npm run test`         | Vitest en modo run                                                      |
| `npm run test:e2e`     | Playwright (chromium) contra `vite preview` reconstruido                |
| `npm run check`        | `openspec validate --all --strict`, typecheck, lint, format:check, test |
| `npm audit`            | Auditoría de dependencias                                               |
