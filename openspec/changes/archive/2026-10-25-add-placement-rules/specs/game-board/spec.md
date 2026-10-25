## MODIFIED Requirements

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
