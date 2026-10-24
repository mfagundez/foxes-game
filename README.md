# Foxes

Juego de navegador basado en una matriz 5x5. Las reglas de juego se especifican change a change con OpenSpec (`openspec/`).

Stack: TypeScript (strict) + Vite, Vitest, Playwright (Chromium), ESLint y Prettier. Node ^26 y npm.

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
