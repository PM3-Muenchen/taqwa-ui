# Taqwa UI Agent Guide

## Developments

- Use tailwind utility classes via @apply inside the taqwa component wrapper class.
- Use `motion` for all animation and transition, never use tailwind for such purpose.

## Toolchain and checks

- Use pnpm 11.26.0 (`packageManager`); CI uses Node 24. Install reproducibly with `pnpm install --frozen-lockfile`.
- There are no lint or test scripts. For library changes, run CI's order: `pnpm typecheck`, `pnpm build`, then `pnpm build-storybook`.
- Use `pnpm storybook` for visual and accessibility checks at `http://localhost:6006`; stories are `src/**/*.stories.ts` (Storybook `web-components-vite`, Lit `html`).

## Package boundaries

- This is one publishable ESM package. `src/index.ts` is the public barrel and the only source included in declaration generation; export new public APIs there. Importing it registers all custom elements, so `sideEffects` must stay `true`.
- Components are Lit elements in Shadow DOM, registered with `@customElement('taqwa-*')` and declared in `HTMLElementTagNameMap`. Expose a `part="base"` on the inner element; form controls use `formAssociated` + `ElementInternals`.
- `pnpm build` produces `dist/index.js` and its declarations; there is no global stylesheet. Each component imports its own `src/<component>.css?inline` (which imports `src/theme.css`) into `static styles`.
- Styles use Tailwind v4 with `source(none)`: only library CSS is compiled. Keep component selectors in the `taqwa-*` namespace and Tailwind utilities prefixed `tq:`; the package deliberately ships no CSS reset, so reset native element styles inside the shadow root as needed.
- Vite externalizes Lit and Motion. When a public component adds a runtime dependency, review `vite.config.ts` so the distribution boundary remains intentional.

## Publishing

- Publishing runs only on a published GitHub Release. Its `v<package-version>` tag must exactly match `package.json`; CI then validates, builds, builds Storybook, and publishes with the `NPM_TOKEN` secret.
