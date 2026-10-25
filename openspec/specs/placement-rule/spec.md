# placement-rule Specification

## Purpose

Define las reglas de colocación de zorros del tablero de Foxes: cuándo dos zorros están en conflicto (mismo bloque, fila, columna o adyacencia), cómo se evalúa el tablero en cada activación y cómo se señalan al jugador, con un resaltado diferido 1 s tras la última activación, las celdas con zorro implicadas.

## Requirements

### Requirement: Conflicto entre zorros por bloque
El sistema SHALL considerar que dos celdas con zorro están en conflicto cuando pertenecen al mismo bloque de color.

#### Scenario: Dos zorros en el mismo bloque
- **WHEN** hay zorros en la fila 1, columna 5 (bloque 2) y en la fila 3, columna 4 (bloque 2), sin otro zorro en el tablero
- **THEN** ambas celdas están en conflicto

#### Scenario: Dos zorros en bloques distintos
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 3, columna 4 (bloque 2), sin otro zorro en el tablero
- **THEN** ninguna celda está en conflicto

### Requirement: Conflicto entre zorros por fila
El sistema SHALL considerar que dos celdas con zorro están en conflicto cuando están en la misma fila.

#### Scenario: Dos zorros en la misma fila
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 1, columna 5 (bloque 2), sin otro zorro en el tablero
- **THEN** ambas celdas están en conflicto

#### Scenario: Dos zorros en filas distintas
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 3, columna 4 (bloque 2), sin otro zorro en el tablero
- **THEN** ninguna celda está en conflicto

### Requirement: Conflicto entre zorros por columna
El sistema SHALL considerar que dos celdas con zorro están en conflicto cuando están en la misma columna.

#### Scenario: Dos zorros en la misma columna
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 5, columna 1 (bloque 4), sin otro zorro en el tablero
- **THEN** ambas celdas están en conflicto

#### Scenario: Dos zorros en columnas distintas
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 3, columna 4 (bloque 2), sin otro zorro en el tablero
- **THEN** ninguna celda está en conflicto

### Requirement: Conflicto entre zorros por adyacencia
El sistema SHALL considerar que dos celdas con zorro están en conflicto cuando son adyacentes, es decir, una está entre las 8 celdas vecinas de la otra, diagonales incluidas.

#### Scenario: Zorros adyacentes en diagonal
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 2, columna 2 (bloque 3), sin otro zorro en el tablero
- **THEN** ambas celdas están en conflicto

#### Scenario: Zorros separados por una celda
- **WHEN** hay zorros en la fila 1, columna 1 (bloque 1) y en la fila 2, columna 3 (bloque 3), sin otro zorro en el tablero
- **THEN** ninguna celda está en conflicto

### Requirement: Solo los zorros cuentan para el conflicto
El sistema SHALL tener en cuenta únicamente las celdas con zorro al detectar conflictos; las celdas vacías y las de césped nunca están en conflicto ni provocan uno.

#### Scenario: Césped junto a un zorro
- **WHEN** hay un zorro en la fila 1, columna 1 y césped en la fila 1, columna 2, la fila 2, columna 1 y la fila 2, columna 2
- **THEN** ninguna celda está en conflicto

### Requirement: Conflictos múltiples
El sistema SHALL marcar como en conflicto cada celda con zorro que participe en al menos un conflicto, tanto si participa en varios como si hay varios pares en conflicto a la vez, y SHALL dejar sin marcar las celdas con zorro que no participen en ninguno.

#### Scenario: Un zorro en varios conflictos
- **WHEN** hay zorros en la fila 1, columna 1, en la fila 1, columna 5 y en la fila 3, columna 1, sin otro zorro en el tablero
- **THEN** las tres celdas están en conflicto
- **AND** la celda de la fila 1, columna 1 lo está por dos conflictos a la vez (fila con la columna 5 y columna con la fila 3)

#### Scenario: Varios pares simultáneos y un zorro sin conflicto
- **WHEN** hay zorros en la fila 1, columna 1, la fila 1, columna 5, la fila 3, columna 1, la fila 4, columna 4, la fila 5, columna 5 y la fila 2, columna 3
- **THEN** están en conflicto las cinco primeras celdas (los pares por fila, por columna y por bloque/adyacencia)
- **AND** la celda de la fila 2, columna 3 no está en conflicto

#### Scenario: Tablero sin conflictos
- **WHEN** hay zorros únicamente en la fila 1, columna 1, la fila 2, columna 3, la fila 3, columna 5 y la fila 4, columna 2
- **THEN** ninguna celda está en conflicto

### Requirement: Resaltado diferido tras la activación
El sistema SHALL evaluar el tablero en cada activación de una celda (cualquier método y cualquier transición, incluida la que quita un zorro) y mostrar el resaltado de los conflictos detectados 1 s después de esa activación. Una nueva activación antes de ese momento SHALL cancelar el resaltado pendiente, de modo que el resaltado aparece 1 s después de la última activación si en ese momento el tablero tiene conflictos.

#### Scenario: Resaltado a un segundo y no antes
- **WHEN** el jugador activa una celda y deja el tablero con conflictos
- **THEN** durante el primer segundo ninguna celda se muestra en conflicto
- **AND** transcurrido 1 s desde la activación se resaltan las celdas con zorro en conflicto

#### Scenario: Cancelación por una nueva activación dentro del segundo
- **WHEN** el jugador activa una celda que deja el tablero con conflictos y, antes de que transcurra 1 s, activa otra celda que lo mantiene con conflictos
- **THEN** no se muestra ningún resaltado a 1 s de la primera activación
- **AND** el resaltado se muestra 1 s después de la segunda

#### Scenario: Un solo resaltado tras varias activaciones rápidas
- **WHEN** el jugador realiza varias activaciones espaciadas menos de 1 s entre sí y el tablero queda con conflictos
- **THEN** el resaltado se muestra una sola vez, 1 s después de la última activación

#### Scenario: Activación con teclado
- **WHEN** el jugador activa una celda con Enter o Espacio y deja el tablero con conflictos
- **THEN** transcurrido 1 s se resaltan las celdas con zorro en conflicto

#### Scenario: Corrección rápida de un conflicto
- **WHEN** el jugador crea un conflicto y lo deshace con otra activación antes de que transcurra 1 s, dejando el tablero sin conflictos
- **THEN** no llega a mostrarse ningún resaltado, ni en ese momento ni transcurrido 1 s desde cualquiera de las dos activaciones

#### Scenario: Quitar un zorro y quedar sin conflictos
- **WHEN** hay celdas resaltadas, el jugador activa un zorro en conflicto para pasarlo a vacía y el tablero queda sin conflictos
- **THEN** el resaltado se borra de inmediato
- **AND** transcurrido 1 s no se resalta ninguna celda

#### Scenario: Quitar un zorro y seguir con conflictos
- **WHEN** hay celdas resaltadas, el jugador quita un zorro y el tablero conserva algún otro conflicto
- **THEN** el resaltado se borra de inmediato
- **AND** transcurrido 1 s desde la activación se resaltan solo las celdas con zorro que siguen en conflicto

### Requirement: Resaltado de conflictos
El sistema SHALL resaltar con borde rojo únicamente cada celda con zorro que participe en al menos un conflicto detectado en la evaluación de la última activación, sin resaltar filas, columnas ni bloques completos. Si el tablero no tiene conflictos, el sistema SHALL NOT resaltar ninguna celda.

#### Scenario: Resaltado solo de las celdas implicadas
- **WHEN** el tablero tiene un conflicto entre dos zorros y transcurre 1 s desde la última activación
- **THEN** solo esas dos celdas se muestran con borde rojo
- **AND** el resto de celdas de su fila, columna y bloque no se resaltan

#### Scenario: Sin conflictos no hay resaltado
- **WHEN** el tablero no tiene conflictos tras una activación
- **THEN** ninguna celda se muestra con borde rojo

#### Scenario: Zorro sin conflicto junto a zorros en conflicto
- **WHEN** el tablero tiene conflictos entre unos zorros, hay otro zorro sin conflicto y transcurre 1 s desde la última activación
- **THEN** el zorro sin conflicto no se muestra con borde rojo

### Requirement: Borrado del resaltado al activar
El sistema SHALL borrar de inmediato todo resaltado visible y cancelar cualquier resaltado pendiente de mostrarse cuando el jugador activa una celda, y SHALL NOT volver a mostrarlo hasta que transcurra 1 s desde esa activación sin otra intermedia.

#### Scenario: Activación con el resaltado visible
- **WHEN** hay celdas resaltadas y el jugador activa cualquier celda
- **THEN** ninguna celda se muestra con borde rojo inmediatamente después de la activación

#### Scenario: El resaltado no reaparece antes del segundo
- **WHEN** el jugador activa una celda con el resaltado visible y el tablero sigue con conflictos
- **THEN** el resaltado no vuelve a mostrarse durante el segundo siguiente a la activación
- **AND** vuelve a mostrarse al cumplirse 1 s desde la última activación

### Requirement: Visibilidad del resaltado de conflicto
El sistema SHALL mostrar el borde de conflicto de forma claramente visible sobre cada uno de los cinco colores de la paleta y distinguible del indicador de foco, también cuando ambos coinciden en la misma celda.

#### Scenario: Borde visible sobre cada color de bloque
- **WHEN** hay una celda con zorro en conflicto en un bloque de cualquiera de los cinco colores
- **THEN** su borde rojo es claramente visible sobre el color de ese bloque

#### Scenario: Celda en conflicto con el foco
- **WHEN** una celda resaltada como en conflicto tiene además el foco de teclado
- **THEN** se distinguen a la vez el borde rojo de conflicto y el indicador de foco
