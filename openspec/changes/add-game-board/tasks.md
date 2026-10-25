# Tasks

## 1. Definición del puzzle y color por bloque

- [x] 1.1 Crear el tipo `PuzzleDefinition` (`{ blocks: number[][] }`, con N = `blocks.length`), el punto único de carga con el puzzle 5×5 provisional de design D2 y la función pura que asigna índice de paleta a cada bloque (specs: Bloques del tablero, Color por bloque; design: D1, D2, D10). Verificar con `npm run typecheck`.
- [x] 1.2 Test unitario de integridad del fixture: todas las filas con longitud N (N = `blocks.length`), exactamente N bloques distintos 1..N y cada bloque contiguo por adyacencia ortogonal (spec: Bloques del tablero); y test de la asignación de colores (mismo bloque, mismo índice; bloques distintos, índices distintos). Verificar con `npm run test` sobre los ficheros de test nuevos.

## 2. Estado y etiquetas del tablero

- [x] 2.1 Implementar el estado inmutable (inicial todo vacío, avance cíclico por celda) y la función pura del nombre accesible «fila R, columna C, bloque B: <estado>» (specs: Ciclo de estado de la celda, Nombre accesible de la celda; design: D3, D4). Verificar con `npm run typecheck`.
- [x] 2.2 Tests unitarios: estado inicial vacío, ciclo completo en tres activaciones, independencia entre celdas, inmutabilidad del estado anterior, y nombres con fila/columna desde 1 y bloque de la definición. Verificar con `npm run test` sobre los ficheros de test nuevos.

## 3. Presentación

- [x] 3.1 Montar el tablero en `#app` desde `src/main.ts`: grupos de tablero y filas, un `button` por celda con `aria-label`, emoji `aria-hidden`, N derivado de la definición, sin persistencia (specs: Tablero inicial, Activación de la celda, Sin persistencia; design: D5, D6, D9). Verificar con `npm run typecheck` y `npm run lint`.
- [x] 3.2 Estilos: paleta de 5 colores por bloque, layout fluido sin scroll horizontal desde 320 px, celdas de al menos 44 px y `:focus-visible` claro (specs: Color por bloque, Layout responsive; design: D7, D8). Verificar con `npm run format:check` y `npm run build`.

## 4. Pruebas Playwright

- [x] 4.1 Crear `tests/e2e/board.spec.ts` con el test de carga, usando `tests/e2e/fixtures.ts`: 25 botones en 5 filas localizados por rol y nombre accesible, todos «…: vacía» y sin contenido (specs: Tablero inicial, Nombre accesible de la celda). Verificar con `npm run test:e2e -- --grep "carga"`.
- [x] 4.2 Tests e2e de interacción: ciclo completo con clic, con Enter y con Espacio, independencia entre celdas, nombre accesible actualizado, recorrido con Tab y recarga que devuelve todo a vacía (specs: Ciclo de estado de la celda, Activación de la celda, Nombre accesible de la celda, Sin persistencia). Verificar con `npm run test:e2e -- --grep "ciclo|teclado|recarga"`.
- [x] 4.3 Tests e2e táctil y responsive dentro del project `chromium`, con `viewport` de 320 px y `hasTouch` por test: activación con `tap` y ausencia de scroll horizontal; y lo mismo en escritorio (spec: Layout responsive; design: D10). Verificar con `npm run test:e2e -- --grep "táctil|responsive"`.

## 5. Validación integral

- [x] 5.1 Ejecutar la vía oficial completa: `npm run check`, `npm run build`, `npm run test:e2e`. Verificar que no hay warnings (AGENTS.md §14.4) y que todo termina en exit 0. Sin cambios de dependencias, por lo que `npm audit` no es obligatorio en este change.

## 6. QA humana

- [x] 6.1 Arrancar `npm run dev` en local y confirmar en escritorio: colores distinguibles, 🌱 y 🦊 legibles sobre cada bloque, ciclo con ratón y teclado, foco visible y recarga. Detener el servidor al terminar.
- [x] 6.2 Confirmar en un dispositivo táctil real. **Acción explícita y temporal**: arrancar `npm run dev -- --host` expone el servidor de desarrollo en la red local; solo con confirmación del responsable técnico, y detenerlo al terminar. Si la QA detecta un fallo, corregir, repetir las validaciones afectadas, reconstruir el frontend servido y pedir repetir la QA. Requiere confirmación humana explícita para marcarse completada.
