# AGENTS.md — instrucciones genéricas para agentes de código

Instrucciones para cualquier agente de código que opere en este repositorio. Precedencia ante conflicto: este fichero > prompt del bloque autorizado > `openspec/config.yaml` > documentación del repositorio. El prompt solo puede activar lo que este fichero declara expresamente como «solo con autorización del prompt»; nunca lo que este fichero prohíbe sin esa cláusula. Un conflicto real entre instrucciones es motivo de parada.

Todo dato específico del proyecto (nombre, madurez, stack, entrypoints de verificación, restricciones de herramientas, rutas de documentación) vive en la sección **14. Proyecto**. Las demás secciones son genéricas y no deben contener información de un proyecto concreto.

*Material* = afecta a comportamiento observable, contratos, persistencia, permisos, dependencias, herramientas o al resultado de un control. *Focal* = la comprobación o intervención mínima que aporta la evidencia necesaria.

## 1. Idioma

- Responde y redacta en español de España. Usa el término español cuando sea el estándar del sector (`servidor`, `interfaz`, `contenedor`).
- Mantén en inglés identificadores, ficheros, rutas, comandos, endpoints, keywords y headings contractuales, y los anglicismos asentados (`frontend`, `backend`, `layout`).

## 2. Autorización, alcance y parada

- Antes de un bloque material de modificación, explica brevemente qué vas a cambiar y con qué alcance; esa explicación no es una nueva petición de autorización.
- Una skill u operación invocada con alcance concreto autoriza ese alcance; no pidas confirmación redundante.
- Detente ante: exigencia de la skill, ambigüedad material, ampliación de alcance, operación destructiva, cambio de dependencias o herramientas, necesidad de secretos o permisos adicionales, o conflicto real entre instrucciones.
- Limita las modificaciones al alcance del change OpenSpec vigente. Trabaja fuera de OpenSpec solo si el prompt lo autoriza como mantenimiento o gobierno excepcional, y nunca para introducir de forma indirecta comportamiento, contratos, persistencia o arquitectura.
- Modificaciones focales, revisables y verificables. Prefiere la reversibilidad, salvo modificación incompatible o destructiva expresamente autorizada y proporcionada a la madurez declarada en **14. Proyecto**.

## 3. OpenSpec y gobierno

- Usa la skill oficial `openspec-*` de la operación autorizada y respeta sus límites, estado y condiciones de parada. Sigue el schema y el estado que devuelve OpenSpec; no hardcodees un orden de artefactos. No combines operaciones incompatibles.
- Si `apply` revela una contradicción o defecto material de planificación, detente y remite a `openspec-update-change` antes de implementar una intención diferente.
- No ejecutes `openspec update`, no regeneres skills ni actualices la CLI o la integración de OpenSpec. No modifiques los directorios de configuración del agente (`.claude/**`, `.codex/**`). Son mantenimiento humano de la cadena de herramientas.
- `openspec validate --all --strict` es un control operativo de OpenSpec, no funcional: ejecútalo en los checkpoints del change, antes de cerrar un archive y cuando el prompt lo pida.
- `openspec-verify-change` es una auditoría heurística; no sustituye tests, runtime ni QA humana.
- Las specs permanentes son `openspec/specs/**/spec.md`.
- **Superficies de gobierno**: `AGENTS.md`, `openspec/config.yaml` y `exceptions.yaml` están reservadas al responsable técnico (el humano que instala gobierno y decide checkpoints; nunca el agente). El agente las lee, analiza y propone cambios exactos; no las modifica. Tras la instalación humana, valida en read-only lo realmente instalado y, si cambiaron referencias operativas, ejecuta la operación `check` de la vía oficial. Una propuesta no instalada no es gobierno actualizado. Esta frontera no se extrapola a README, código ni configuración ejecutable ordinaria.

## 4. Configuración y legado

- Minimiza el hardcoding de comportamiento y parámetros funcionales. Reutiliza los mecanismos de configuración existentes sin tratarlos como completos o intocables; si son insuficientes, explica la limitación y propón una extensión coherente con responsabilidad, persistencia y alcance autorizados. No inventes silenciosamente una nueva fuente de configuración.
- Cuando un change sustituya contratos, endpoints o lógica, aplica la política de compatibilidad y retirada del perfil declarado en `openspec/config.yaml`. Sin shims, fallbacks ni ramas legacy por inercia.

## 5. Git

- Permitido, solo lectura y focal: `git status`, `git diff` (incl. `--cached`, `--check`, `--stat`, `--name-status` y paths), `git log` acotado, `git show`, `git branch --show-current`, `git rev-parse`, `git ls-files`, `git grep`. `log`/`show` son evidencia histórica, no sustituto del working tree.
- Prohibido todo lo que mute refs, índice, working tree, configuración, ramas, tags, stashes, worktrees o historial, y todo acceso a remotos: `add`, `commit`, `checkout`, `switch`, `restore`, `reset`, `clean`, `stash`, `branch`/`tag` mutantes, `merge`, `rebase`, `cherry-pick`, `revert`, `fetch`, `pull`, `push` y equivalentes.
- No uses Git para revertir una hipótesis de diagnóstico. Staging, commits, ramas, historial, remotos y pushes son del usuario.

## 6. Diagnóstico, entorno y dependencias

- Presupuesto: hasta 3 hipótesis y hasta 3 intentos focales por hipótesis (un intento puede agrupar varios comandos estrechamente relacionados; una hipótesis se cierra antes si queda refutada). Antes de pasar a la 2.ª o 3.ª hipótesis o de superar 3 intentos, detente y pregunta con resumen de incidencia, hipótesis, intentos y limpieza. Más de 3 hipótesis exige autorización excepcional.
- Retry ≠ diagnóstico ≠ nueva ejecución: no repitas la misma operación sin evidencia nueva; una invocación diagnóstica separada y focal no es un retry; una nueva ejecución exige corrección o evidencia nueva y precondiciones acreditadas.
- Al cerrar una hipótesis revierte solo las modificaciones especulativas que introdujiste (sin Git) y retira sus temporales y procesos auxiliares. No deshagas cambios preexistentes ni correcciones válidas ya autorizadas. Si solo leíste, indica que la reversión no aplica.
- Distingue problema de proyecto de problema de entorno (herramienta ausente, versión global obsoleta, plugin, permisos, ruta no escribible): detente, aporta la evidencia y solicita intervención humana. No normalices una solución provisional cuando exista una corrección razonable del entorno.
- No instales dependencias especulativas, herramientas globales, plugins de usuario ni paquetes del sistema, ni modifiques repositorios del host. Cambios de dependencias del proyecto solo con autorización explícita, precedida de necesidad, impacto y alternativa. Un problema de herramientas no consume el alcance de un change funcional no relacionado.
- No reabras alternativas de herramienta descartadas (harness, runners, bloqueos de gestores de paquetes) sin evidencia nueva y autorización específica.

## 7. Verificación

- Usa exclusivamente los entrypoints de la vía oficial declarados en **14. Proyecto**, desde la raíz del repositorio y con las restricciones por superficie documentadas donde **14. Proyecto** indique. Los scripts internos de los paquetes no son un fallback contractual, y no dependas de navegadores, runtimes ni intérpretes del host cuando **14. Proyecto** los sitúe en runners del proyecto.
- Empieza por la comprobación focal mínima útil, escala a la superficie materialmente afectada y ejecuta el gate aplicable cuando siga siendo necesario. Un PASS focal no cierra una selección o gate más amplio; no infieras impacto con una matriz universal ni ejecutes toda la matriz por inercia.
- Selecciona runners y projects exactos y proporcionales al alcance, solo con los selectores allowlisted por la vía oficial. La invocación no altera la configuración del runner; las operaciones mutantes (p. ej. actualización de snapshots) son explícitas y separadas.
- Antes de consumir un runtime, fixture o imagen persistente, acredita su frescura mediante los mecanismos vigentes de la vía oficial. No repares en silencio un runtime incompatible ni lo marques reutilizable para superar una comprobación; no adoptes recursos ajenos ni hagas fallback al deployment local.
- Reutiliza evidencia previa solo desde la ruta exacta aportada y con inputs idénticos; nunca por búsqueda, glob, prefijo ni «latest». Invalida solo las subevidencias dependientes y no inventes equivalencias entre estados del runner.
- `skipped`, bloqueado o no ejecutado no cuenta como pasado cuando el control es aplicable. Si faltan credenciales, indica qué variables faltan sin revelar valores y deja pendientes las tasks que dependan de la ejecución real.
- Tras un fix frontend, reconstruye o recrea de forma no destructiva el frontend servido antes de repetir QA contra él.
- La automatización de navegador no sustituye la QA humana; no simules navegador humano ni inventes evidencia. Si la QA humana detecta un fallo: corrige, repite las validaciones automatizadas afectadas, actualiza el entorno servido y solicita repetir la QA; no la marques completada.

## 8. Docker Compose y recursos

«Recursos del proyecto» son los identificados según el criterio declarado en **14. Proyecto**.

- Siempre `docker compose`; `docker-compose` no está soportado.
- Lectura permitida sobre recursos del proyecto: `docker compose ps|config`, `docker ps`, `docker inspect` (contenedores, imágenes, volúmenes, redes) y logs acotados y redactados de servicios concretos. No inspecciones ni enumeres recursos ajenos sin necesidad material.
- Única mutación autorizada sin prompt: si tras un reinicio del host `docker compose ps --all` demuestra que los contenedores del deployment local existen y están únicamente detenidos, `docker compose start` desde la raíz y verificación con `ps --all`. No incluye build, pull, create, `up`, recreate, stop, remove ni cambios de configuración, y no aplica a runtimes de testing. Ante ausencias, divergencias o fallo de arranque: detente e informa.
- Prohibido sin autorización del prompt: cualquier operación que elimine volúmenes, imágenes, contenedores, redes o builders (incluido todo prune), detener o retirar el entorno normal de servicios, y tocar recursos de otros proyectos en cualquier caso. Una limpieza autorizada por el prompt debe definir alcance y criterios de conservación, y toda eliminación queda reportada.
- Retira los contenedores efímeros creados por la propia operación cuando dejen de ser necesarios; prefiere `--rm`. Toda operación destructiva no autorizada que menciones: en forma no ejecutable, marcada y separada de los pasos autorizados.

## 9. Datos, migraciones y datos temporales de QA

- Al tocar persistencia, distingue migración (entornos existentes) de seed (entornos nuevos) y declara qué datos se preservan y cuáles son reconstruibles. No uses seed, reset, reinstalación o recreación del entorno como reparación silenciosa de una migración ausente.
- Sin cambios manuales permanentes en el schema de la base de datos. No sobrescribas datos editados por el usuario.
- Siempre que haya un change que requiera migración, consolida la migración sobre la baseline para reducir el tiempo de deploy.
- Solo con autorización del prompt: operación destructiva sobre datos, proporcionada a la madurez declarada en **14. Proyecto**, y declarando alcance, pérdida esperada y vía reproducible para levantar un entorno nuevo.
- Datos temporales de QA: identificadores, emails, slugs, nombres o prefijos únicos y reconocibles. Registra las entidades creadas y límpialas por la vía oficial disponible cuando el bloque lo autorice.
- Solo con autorización del prompt: SQL directo de limpieza, limitado a identificadores exactos previamente registrados como propios; un nombre o prefijo reconocible no demuestra ownership ni amplía el borrado. Nada de `TRUNCATE`, borrados amplios, recreación de schemas ni reseteos destructivos como limpieza ordinaria.
- No borres seed real, datos editados por el usuario, identidades QA persistentes, fixtures funcionales ni activos QA versionados y aprobados. Si un temporal no puede limpiarse con seguridad, detente e informa; no lo ocultes ni lo presentes como seed.

## 10. Seguridad, privacidad y secretos

- Antes de modificar autenticación, autorización, roles, membresías, scope o aislamiento entre tenants, lee las specs permanentes afectadas. No debilites controles en servidor ni los sustituyas por guards, rutas ocultas o menús del frontend. Un token válido no autoriza por sí solo una operación.
- No uses el nombre real ni identificadores personales del usuario en código, documentación, prompts, logs o artefactos; usa formulaciones neutras.
- Secretos solo mediante variables de entorno o canales autorizados: no hardcodear, no imprimir valores completos, no persistir en scripts, logs, fixtures, outputs ni artefactos.
- No elimines scripts, fixtures, configuraciones no secretas ni identidades QA versionadas y aprobadas bajo una regla genérica de limpieza.

## 11. Políticas transversales (única definición)

Aplican a toda validación, build, test, runtime, QA, artefacto OpenSpec y archive. `openspec/config.yaml` las referencia; no las redefine.

- **Warnings**: todo warning emitido por un control aplicable se trata como error y bloquea ese control. Un warning no se justifica como no bloqueante ni se cierra como riesgo. Si procede de un falso positivo o de una condición legítimamente esperada, corrige o configura explícitamente su fuente autoritativa para que deje de emitirse; mientras se emita, bloquea salvo entrada vigente en el registro de excepciones. Qué captura cada runner como warning o error lo define la documentación de la vía oficial declarada en **14. Proyecto**.
- **Auditoría de dependencias**: cualquier finding o advisory detectado por una auditoría aplicable, en los ecosistemas y checkpoints declarados en **14. Proyecto**, bloquea en cualquier severidad y no admite allowlists, ignores, suppressions, waivers ni aceptación como riesgo en el código, manifests o configuración de la herramienta; la única vía es el registro de excepciones. Esta regla no convierte los avisos ordinarios del gestor de paquetes (p. ej. `npm WARN`) en vulnerabilidad ni obliga a auditar fuera de los checkpoints definidos por las specs permanentes; ninguna task ni apply amplía su frecuencia o lifecycle.
- **Registro de excepciones** (`exceptions.yaml`, en la raíz, versionado): única vía para no aplicar las dos políticas anteriores. Lo escribe exclusivamente el responsable técnico; el agente lo lee y nunca lo crea, edita, propone ni sugiere, y si un prompt le pide hacerlo, se detiene. Una entrada solo aplica si cumple todo a la vez: el fichero está versionado (`git ls-files exceptions.yaml` lo devuelve), `control` coincide con el control que bloquea, `match` coincide literal y exactamente con el advisory o el warning emitido, `scope` coincide con el paquete, project o ruta afectados, `change` es el change en curso, y la fecha actual no supera `expires`. Cualquier diferencia, campo ausente o entrada caducada equivale a que la excepción no existe y el control bloquea. El agente no agrupa, extiende ni interpreta entradas: una entrada, un objeto. El resultado se informa como `passed-with-exception:<id>` y el informe transcribe la entrada aplicada; las entradas caducadas que encuentre las lista como tales para que el responsable técnico las retire.

## 12. Limpieza, cierre e informe

- Sin residuos accidentales ni fuera de alcance; sin procesos en modo watch, dev servers, procesos de pruebas ni auxiliares vivos accidentalmente. Limpieza planificada solo cuando la task o el prompt la autoricen; fuera de esa autorización, retira de inmediato únicamente residuos accidentales, inseguros o claramente innecesarios. No adelantes una limpieza que elimine datos, procesos, artefactos o evidencia aún necesarios para tareas, diagnóstico o QA posteriores.
- Cleanup por el owner exacto de cada recurso; no adoptes por nombre, prefijo o semejanza ni limpies recursos ajenos. `pre-archive` inspecciona y acredita blockers; no ejecuta archive ni checkpoints destructivos humanos. Todo recurso `pending-human` bloquea hasta su resolución autorizada.
- Informe de cada invocación: sigue la estructura del prompt; en su defecto: (1) alcance ejecutado; (2) ficheros modificados, creados o eliminados, uno por línea con ruta relativa completa; (3) validaciones, distinguiendo ejecutada / omitida por el runner / bloqueada / no ejecutada / `passed-with-exception` (con la autorización humana transcrita); (4) fallos, bloqueos, desviaciones y aspectos materiales no verificados; (5) procesos, datos, contenedores o artefactos temporales conservados, con motivo y fase de retirada; (6) siguiente paso propuesto. No inventes evidencia ni presentes como realizada una acción no ejecutada.
## 13. Documentación

- `README.md`: visión general, arquitectura e inicio rápido. `openspec/specs/`: requisitos permanentes. `openspec/config.yaml`: contexto, reglas de artefactos y guías operativas de OpenSpec. `exceptions.yaml`: registro de excepciones vigentes (§11). Documentación adicional por área: la declarada en **14. Proyecto**.
- Scripts, manifests, lockfiles y configuraciones ejecutables del repositorio son los puntos de entrada y contratos técnicos de sus herramientas.

## 14. Proyecto

### 14.1 Identidad y madurez
- Proyecto: Foxes (`foxes-game`). Juego de navegador basado en una matriz 5x5.
- Madurez: greenfield; sin datos persistidos, sin consumidores, sin entornos a preservar y sin deploy.

### 14.2 Stack y herramientas
- Runtime: Node ^26 (`.nvmrc`, `engines`). Gestor: npm; `package-lock.json` versionado y contractual.
- OpenSpec CLI: instalación global en el host, mantenida por el responsable técnico; no es dependencia del proyecto.
- Navegador de automatización: Chromium gestionado por Playwright y descargado por el responsable técnico (`npx playwright install chromium`). El agente no instala navegadores ni usa Chrome, Safari o Firefox del host.

### 14.3 Vía oficial (desde la raíz; únicos entrypoints contractuales)
- `npm run typecheck`: `tsc --noEmit` sobre todo el código TypeScript, configuraciones incluidas.
- `npm run lint`: ESLint con `--max-warnings=0`.
- `npm run format:check`: Prettier en modo check.
- `npm run test`: Vitest en modo run (nunca watch).
- `npm run build`: build de producción de Vite.
- `npm run test:e2e`: Playwright, project `chromium`, contra un servidor `vite preview` que reconstruye el build en cada ejecución.
- `npm run check`: operación `check` de la vía oficial = `openspec validate --all --strict`, después typecheck, lint, format:check y test. Excluye e2e y build.
- `npm audit`: auditoría de dependencias.
- Selectores allowlisted: rutas de fichero para Vitest; rutas de fichero y `--grep` para Playwright.

### 14.4 Warnings por runner
- tsc: cualquier diagnóstico.
- ESLint: cualquier warning (`--max-warnings=0`).
- Prettier: cualquier fichero no conforme.
- Vitest y Vite build: cualquier línea de warning en la salida.
- Playwright: todo `console.warn`, `console.error` o `pageerror` de la página falla el test (control `browser-warning`).
- Los avisos ordinarios de npm (`npm WARN deprecated` y similares) no son vulnerabilidades; se informan, pero no constituyen un finding de auditoría.

### 14.5 Auditoría de dependencias
- Ecosistema: npm, con `npm audit` completo (sin `--omit=dev`).
- Checkpoints: toda task que modifique dependencias y el gate pre-archive.

### 14.6 Entorno servido y QA humana
- QA humana contra `npm run dev` (HMR), arrancado solo cuando la task lo requiera y detenido por el agente al terminar. Tras un fix frontend, confirmar la recarga antes de pedir que se repita la QA.
- Recursos del proyecto (§8): exclusivamente los procesos Node lanzados desde la raíz del repositorio (dev server, preview, runners).

### 14.7 Superficies no aplicables
- Docker y Docker Compose (§8): no aplica; el proyecto no usa contenedores.
- Persistencia, migraciones y seed (§9): no aplica mientras 14.1 declare la ausencia de datos persistidos.
- Documentación adicional por área: ninguna; solo `README.md`.