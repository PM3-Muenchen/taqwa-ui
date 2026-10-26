# Taqwa UI Agent Guide

## Developments

- Use tailwind utility classes via @apply inside the taqwa component wrapper class.
- Use `motion` for all animation and transition, never use tailwind for such purpose.

## Toolchain and checks

- Use pnpm 11.26.0 (`packageManager`); CI uses Node 24. Install reproducibly with `pnpm install --frozen-lockfile`.
- There are no lint or test scripts. For library changes, run CI's order: `pnpm typecheck`, `pnpm build`, then `pnpm build-storybook`.
- Use `pnpm storybook` for visual and accessibility checks at `http://localhost:6006`; stories are `src/**/*.stories.{ts,tsx}`.

## Package boundaries

- This is one publishable ESM package. `src/index.ts` is the public barrel and the only source included in declaration generation; export new public APIs there.
- `pnpm build` produces `dist/index.js`, `dist/index.d.ts`, and `dist/styles.css`. The stylesheet is a separate public export (`@pm3/taqwa-ui/styles.css`), so component style changes belong in `src/styles.css`.
- Components wrap and re-export Base UI. Preserve Base UI prop and ref behavior when adding Taqwa variants; use `cn` from `src/utils.ts` for class composition.
- Styles use Tailwind v4 with `source(none)`: only library CSS is compiled. Keep component selectors in the `taqwa-*` namespace and Tailwind utilities prefixed `tq:` to avoid consumer collisions; the package deliberately ships no CSS reset.
- Vite externalizes React, Base UI, Motion, and class-name dependencies. When a public component adds a runtime dependency, review `vite.config.ts` so the distribution boundary remains intentional.

## Publishing

- Publishing runs only on a published GitHub Release. Its `v<package-version>` tag must exactly match `package.json`; CI then validates, builds, builds Storybook, and publishes with the `NPM_TOKEN` secret.
