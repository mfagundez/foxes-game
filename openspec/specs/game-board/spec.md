# game-board Specification

## Purpose

Define el tablero de Foxes: una cuadrícula N×N dividida en bloques contiguos de color en la que el jugador marca cada celda como vacía, césped o zorro, con interacción accesible por puntero, toque y teclado y sin persistencia entre cargas.

## Requirements

### Requirement: Tablero inicial
El sistema SHALL mostrar al cargar la página un tablero cuadrado de N×N celdas, agrupadas en N filas de N celdas, todas en estado vacía. El tablero entregado es de 5×5.

#### Scenario: Carga del tablero 5×5
- **WHEN** el jugador abre la página
- **THEN** se muestran 25 celdas agrupadas en 5 filas de 5 celdas
- **AND** todas las celdas están vacías y no muestran contenido

### Requirement: Color por bloque
El sistema SHALL mostrar cada celda con el color de su bloque, usando un color distinto por bloque, de una paleta neutra, de modo que los colores se distingan claramente entre sí y mantengan visible el contenido de la celda.

#### Scenario: Celdas del mismo bloque
- **WHEN** dos celdas pertenecen al mismo bloque
- **THEN** ambas se muestran con el mismo color

#### Scenario: Celdas de bloques distintos
- **WHEN** dos celdas pertenecen a bloques distintos
- **THEN** se muestran con colores distintos

#### Scenario: Contenido legible sobre el color
- **WHEN** una celda muestra césped o zorro
- **THEN** el contenido es claramente visible sobre el color de su bloque, sea cual sea el bloque

### Requirement: Ciclo de estado de la celda
El sistema SHALL avanzar el estado de una celda en cada activación siguiendo el ciclo vacía → césped → zorro → vacía. La celda vacía no muestra contenido, la de césped muestra 🌱 y la de zorro muestra 🦊. El estado de cada celda es independiente del de las demás.

#### Scenario: Ciclo completo
- **WHEN** el jugador activa tres veces seguidas una celda vacía
- **THEN** la celda pasa sucesivamente a césped (🌱), a zorro (🦊) y de nuevo a vacía sin contenido

#### Scenario: Independencia entre celdas
- **WHEN** el jugador activa una celda
- **THEN** el estado de todas las demás celdas no cambia

### Requirement: Activación de la celda
El sistema SHALL permitir activar una celda con clic, con toque y con las teclas Enter o Espacio estando la celda enfocada, y SHALL permitir llegar a cada celda con el foco de teclado. Cada método avanza el estado una sola vez por activación.

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

### Requirement: Nombre accesible de la celda
El sistema SHALL exponer para cada celda el nombre accesible «fila R, columna C, bloque B: <estado>», con R y C empezando en 1, B el número del bloque de la celda (1..N) y <estado> uno de vacía, césped o zorro. El nombre SHALL actualizarse en cada cambio de estado. Mientras una celda esté resaltada como en conflicto, su nombre accesible SHALL ser «fila R, columna C, bloque B: zorro, en conflicto»; el sufijo «, en conflicto» SHALL desaparecer en los mismos momentos en que desaparece el resaltado.

#### Scenario: Nombres al cargar
- **WHEN** el jugador abre la página
- **THEN** cada celda tiene el nombre «fila R, columna C, bloque B: vacía» con su fila, columna y bloque correctos

#### Scenario: Nombre tras activar
- **WHEN** el jugador activa la celda de la fila 2, columna 3
- **THEN** su nombre pasa a «fila 2, columna 3, bloque B: césped» con el bloque B de esa celda
- **AND** tras una segunda activación pasa a «…: zorro» y tras una tercera a «…: vacía»

#### Scenario: Nombre de una celda en conflicto
- **WHEN** una celda con zorro se resalta como en conflicto al cumplirse el retardo de 1 s tras la última activación
- **THEN** su nombre pasa a «fila R, columna C, bloque B: zorro, en conflicto»

#### Scenario: Nombre de una celda con zorro sin conflicto
- **WHEN** una celda con zorro no está resaltada como en conflicto
- **THEN** su nombre es «fila R, columna C, bloque B: zorro», sin el sufijo «, en conflicto»

#### Scenario: El sufijo desaparece con el resaltado
- **WHEN** hay una celda con el nombre «…: zorro, en conflicto» y el jugador activa cualquier celda
- **THEN** el nombre de la celda deja de incluir «, en conflicto» de inmediato
- **AND** el sufijo solo vuelve si, transcurrido 1 s desde la última activación, el tablero sigue con la celda en conflicto

### Requirement: Layout responsive
El sistema SHALL mostrar el tablero completo y usable en escritorio y en móvil táctil, sin scroll horizontal en la página con un ancho de pantalla de 320 px o superior.

#### Scenario: Pantalla móvil
- **WHEN** el jugador abre la página en una pantalla táctil de 320 px de ancho
- **THEN** el tablero completo es visible y no aparece scroll horizontal
- **AND** todas las celdas se pueden tocar

#### Scenario: Pantalla de escritorio
- **WHEN** el jugador abre la página en una ventana de escritorio
- **THEN** el tablero completo es visible, sin scroll horizontal

### Requirement: Sin persistencia
El sistema SHALL mostrar todas las celdas vacías cada vez que se carga la página, sin conservar el estado de cargas anteriores.

#### Scenario: Recarga de la página
- **WHEN** el jugador deja celdas en césped o zorro y recarga la página
- **THEN** todas las celdas vuelven a estar vacías

### Requirement: Bloques del tablero
El sistema SHALL mostrar el tablero dividido en exactamente N bloques, numerados de 1 a N, cada uno formado por celdas contiguas por adyacencia ortogonal.

#### Scenario: Bloques del tablero 5×5
- **WHEN** el jugador abre la página
- **THEN** el tablero 5×5 presenta exactamente 5 bloques numerados de 1 a 5
- **AND** las celdas de cada bloque son contiguas por adyacencia ortogonal
