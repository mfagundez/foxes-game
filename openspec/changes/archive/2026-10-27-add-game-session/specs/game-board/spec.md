# Spec Delta

## MODIFIED Requirements

### Requirement: Activación de la celda
El sistema SHALL permitir activar una celda con clic, con toque y con las teclas Enter o Espacio estando la celda enfocada, y SHALL permitir llegar a cada celda con el foco de teclado. Cada método avanza el estado una sola vez por activación. Una vez ganada la partida (capability `game-session`), ningún método de activación SHALL cambiar el estado de las celdas, que seguirán pudiendo recibir el foco de teclado.

#### Scenario: Activación con clic
- **WHEN** el jugador hace clic en una celda vacía
- **THEN** la celda pasa a césped

#### Scenario: Activación con toque
- **WHEN** el jugador toca una celda vacía en un dispositivo táctil
- **THEN** la celda pasa a césped

#### Scenario: Activación con teclado
- **WHEN** el jugador enfoca una celda vacía con el teclado y pulsa Enter
- **THEN** la celda pasa a césped
- **AND** al pulsar Espacio con la celda enfocada, avanza un estado más

#### Scenario: Foco con teclado
- **WHEN** el jugador recorre la página con la tecla Tab
- **THEN** cada una de las celdas recibe el foco y el foco es visible

#### Scenario: Sin activación tras la victoria
- **WHEN** la partida está ganada y el jugador activa una celda con clic, toque, Enter o Espacio
- **THEN** el estado de la celda no cambia

#### Scenario: Foco tras la victoria
- **WHEN** la partida está ganada y el jugador recorre la página con la tecla Tab
- **THEN** las celdas siguen recibiendo el foco de teclado de forma visible
