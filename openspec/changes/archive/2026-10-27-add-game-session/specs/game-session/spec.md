# Spec Delta

## Purpose

Define el ciclo de partida de Foxes: el cronómetro que arranca al cargar la página, la condición de victoria evaluada por reglas, y el fin de partida con el tablero bloqueado, el mensaje de victoria con el tiempo empleado y su anuncio a lectores de pantalla.

## ADDED Requirements

### Requirement: Inicio de partida
El sistema SHALL iniciar una partida en cuanto el tablero se muestra al cargar la página, con el tablero vacío y el cronómetro en 00:00. La partida SHALL empezar sin ninguna acción del jugador.

#### Scenario: Partida nueva al cargar
- **WHEN** el jugador abre la página
- **THEN** el cronómetro muestra 00:00
- **AND** el tablero está vacío y no se muestra ningún mensaje de victoria

#### Scenario: Recarga durante o tras una partida
- **WHEN** el jugador recarga la página con una partida en curso o ya ganada
- **THEN** se inicia una partida nueva con el cronómetro en 00:00, el tablero vacío y sin mensaje de victoria

### Requirement: Cronómetro de partida
El sistema SHALL mostrar durante toda la partida un cronómetro con el tiempo real transcurrido desde el inicio de la partida, con precisión de segundos truncando hacia abajo, que avanza mientras la partida no esté ganada y sin pausa.

#### Scenario: El cronómetro avanza
- **WHEN** transcurren 3 s desde el inicio de la partida sin victoria
- **THEN** el cronómetro muestra 00:03

#### Scenario: Truncado hacia abajo
- **WHEN** transcurren 999 ms desde el inicio de la partida
- **THEN** el cronómetro muestra 00:00
- **AND** al cumplirse 1000 ms muestra 00:01

#### Scenario: Pestaña oculta o en segundo plano
- **WHEN** la pestaña permanece oculta o en segundo plano durante 30 s y el jugador vuelve a ella
- **THEN** el cronómetro refleja los 30 s transcurridos

### Requirement: Formato del cronómetro
El sistema SHALL mostrar el tiempo en formato mm:ss, con los minutos con al menos dos dígitos (cero a la izquierda) y los segundos siempre con dos dígitos. El formato SHALL NOT pasar a horas: los minutos siguen creciendo más allá de 59.

#### Scenario: Menos de un minuto
- **WHEN** han transcurrido 59 s
- **THEN** se muestra 00:59

#### Scenario: Minutos de un dígito
- **WHEN** han transcurrido 9 min 59 s
- **THEN** se muestra 09:59

#### Scenario: A partir de 10 minutos
- **WHEN** han transcurrido 10 min
- **THEN** se muestra 10:00

#### Scenario: A partir de 60 minutos
- **WHEN** han transcurrido 75 min 3 s
- **THEN** se muestra 75:03
- **AND** no se muestra ningún campo de horas

#### Scenario: A partir de 100 minutos
- **WHEN** han transcurrido 100 min
- **THEN** se muestra 100:00

### Requirement: Posición y aspecto del cronómetro
El sistema SHALL mostrar el cronómetro encima del tablero y alineado a su derecha, visible durante toda la partida, con un tamaño discreto pero fácil de localizar, tanto en escritorio como en móvil, sin provocar scroll horizontal con un ancho de pantalla de 320 px o superior.

#### Scenario: Posición en escritorio
- **WHEN** el jugador abre la página en una ventana de escritorio
- **THEN** el cronómetro se muestra encima del tablero, alineado a la derecha de este

#### Scenario: Posición en móvil
- **WHEN** el jugador abre la página en una pantalla táctil de 320 px de ancho
- **THEN** el cronómetro se muestra encima del tablero, alineado a la derecha de este
- **AND** no aparece scroll horizontal

#### Scenario: Visible durante la partida y tras la victoria
- **WHEN** la partida está en curso o ya está ganada
- **THEN** el cronómetro sigue visible encima del tablero

### Requirement: Condición de victoria
El sistema SHALL dar la partida por ganada cuando el tablero contiene exactamente N zorros (N = número de bloques = tamaño del tablero) y ninguno está en conflicto según `placement-rule`. La evaluación SHALL hacerse en cada activación, en el momento de producirse y sin esperar al retardo del resaltado de conflictos. Las celdas con césped o vacías SHALL NOT impedir la victoria. Cualquier disposición válida cuenta como victoria, sin compararla con una solución predeterminada.

#### Scenario: Victoria al colocar el N-ésimo zorro
- **WHEN** el tablero tiene N-1 zorros sin conflicto entre sí y el jugador coloca el N-ésimo zorro de modo que ninguno queda en conflicto
- **THEN** la partida se da por ganada inmediatamente

#### Scenario: Victoria con celdas de césped
- **WHEN** el tablero tiene N zorros sin conflicto y otras celdas en césped
- **THEN** la partida está ganada

#### Scenario: Cualquier disposición válida
- **WHEN** el jugador completa una disposición de N zorros sin conflicto distinta de otra disposición válida del mismo puzzle
- **THEN** la partida está ganada igualmente

#### Scenario: N zorros con algún conflicto
- **WHEN** el tablero tiene N zorros y al menos dos están en conflicto
- **THEN** la partida no se da por ganada y el cronómetro sigue avanzando

#### Scenario: Menos de N zorros
- **WHEN** el tablero tiene menos de N zorros, aunque ninguno esté en conflicto
- **THEN** la partida no se da por ganada

#### Scenario: Se rompe la victoria potencial
- **WHEN** el tablero tiene N zorros con conflicto y el jugador retira uno de ellos
- **THEN** la partida no se da por ganada por tener N-1 zorros

### Requirement: Fin de partida con cronómetro detenido
El sistema SHALL detener el cronómetro en el instante de la victoria y mantenerlo fijo en el valor que mostraba en ese momento, sin que vuelva a avanzar.

#### Scenario: El cronómetro se detiene en la victoria
- **WHEN** el jugador gana con el cronómetro en 01:07
- **THEN** el cronómetro permanece en 01:07 aunque transcurran 60 s más

#### Scenario: Victoria dentro del mismo segundo
- **WHEN** el jugador gana a los 1500 ms de iniciada la partida
- **THEN** el cronómetro queda fijo en 00:01

### Requirement: Mensaje de victoria
El sistema SHALL superponer sobre el tablero, al ganar, el texto «¡Victoria!» y, en la línea de debajo, el tiempo empleado en formato mm:ss con el mismo valor en que se detuvo el cronómetro. El tablero SHALL seguir visible debajo del mensaje y el mensaje SHALL ser legible sobre cualquier color de bloque, en escritorio y en móvil.

#### Scenario: Mensaje con el tiempo
- **WHEN** el jugador gana con el cronómetro detenido en 01:07
- **THEN** sobre el tablero se muestra «¡Victoria!» y, en la línea inferior, 01:07

#### Scenario: Coincidencia con el cronómetro
- **WHEN** la partida está ganada
- **THEN** el tiempo del mensaje es idéntico al mostrado por el cronómetro detenido

#### Scenario: Tablero visible bajo el mensaje
- **WHEN** se muestra el mensaje de victoria
- **THEN** las 25 celdas siguen visibles con su contenido

#### Scenario: Sin mensaje antes de ganar
- **WHEN** la partida está en curso
- **THEN** no se muestra el mensaje de victoria

### Requirement: Tablero bloqueado tras la victoria
El sistema SHALL, tras la victoria, no responder a clic, toque, Enter ni Espacio sobre las celdas y mantener congelado el estado de todas ellas. El bloqueo SHALL ser perceptible para tecnologías de apoyo sin cambiar el nombre accesible de las celdas.

#### Scenario: Clic tras la victoria
- **WHEN** la partida está ganada y el jugador hace clic en una celda
- **THEN** el estado de ninguna celda cambia

#### Scenario: Toque tras la victoria
- **WHEN** la partida está ganada y el jugador toca una celda en un dispositivo táctil
- **THEN** el estado de ninguna celda cambia

#### Scenario: Teclado tras la victoria
- **WHEN** la partida está ganada y el jugador pulsa Enter o Espacio con una celda enfocada
- **THEN** el estado de ninguna celda cambia

#### Scenario: Nombre accesible sin cambios
- **WHEN** la partida está ganada
- **THEN** el nombre accesible de cada celda sigue siendo «fila R, columna C, bloque B: <estado>» con el estado en que quedó
- **AND** las tecnologías de apoyo indican que la celda no es operable

#### Scenario: Sin resaltado pendiente
- **WHEN** la partida se gana tras una activación que cancela un resaltado de conflicto pendiente
- **THEN** no aparece ningún resaltado de conflicto después de la victoria

### Requirement: Anuncio accesible de la victoria
El sistema SHALL anunciar a los lectores de pantalla la victoria y el tiempo empleado en el momento de producirse, sin que el jugador tenga que buscar el mensaje, y SHALL NOT anunciar de forma continua el avance del cronómetro.

#### Scenario: Anuncio al ganar
- **WHEN** el jugador gana con el cronómetro detenido en 01:07
- **THEN** se anuncia a los lectores de pantalla la victoria y el tiempo 01:07

#### Scenario: Sin anuncios durante la partida
- **WHEN** la partida está en curso y el cronómetro avanza
- **THEN** el avance del cronómetro no genera anuncios a lectores de pantalla
