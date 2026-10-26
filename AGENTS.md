# Taqwa UI Agent Guide

## Developments

- Use tailwind utility classes via @apply inside the taqwa component wrapper class.
- Use `motion` for all animation and transition, never use tailwind for such purpose.
- `DESIGN.md` is the source of truth for the visual identity (tokens, roles, spacing, glass). Keep it in sync with `src/theme.css`.

## Toolchain and checks

- Use pnpm 11.26.0 (`packageManager`); CI uses Node 24. Install reproducibly with `pnpm install --frozen-lockfile`.
- There are no lint or test scripts. For library changes, run CI's order: `pnpm typecheck`, `pnpm build`, then `pnpm build-storybook`.
- Use `pnpm storybook` for visual and accessibility checks at `http://localhost:6006`; stories are `src/**/*.stories.ts` (Storybook `web-components-vite`, Lit `html`).

## Package boundaries

- This is one publishable ESM package. Every top-level `src/<name>.ts` (not stories) is a build entry and a public subpath (`@pm3/taqwa-ui/<name>`, via the `./*` export). `src/index.ts` is the barrel that re-exports all of them; importing anything registers its custom elements, so `sideEffects` must stay `true`. `src/internal/` is private.
- Components are Lit elements in Shadow DOM, registered with `@customElement('taqwa-*')` and declared in `HTMLElementTagNameMap`. Expose a `part="base"` on the inner element; form controls extend `TaqwaFormControl` (`src/internal/form-control.ts`, `formAssociated` + `ElementInternals`).
- `pnpm build` produces `dist/<name>.js` per entry and declarations; there is no global stylesheet. Each component imports its own `src/<component>.css?inline` (which imports `src/theme.css`) into `static styles`.
- Styles use Tailwind v4 with `source(none)`: only library CSS is compiled. Keep component selectors in the `taqwa-*` namespace and Tailwind utilities prefixed `tq:`; the package deliberately ships no CSS reset, so reset native element styles inside the shadow root as needed.
- Vite externalizes Lit, Motion, `@floating-ui/*` and React. `lucide` is a dev dependency whose used icons are bundled. When a public component adds a runtime dependency, review `vite.config.ts` so the distribution boundary remains intentional.
- Modules must be importable in Node (Astro, Next.js): never touch `window`, `document`, `matchMedia`, etc. at module top level or in constructors. Do it in lifecycle callbacks or event handlers.

## Component authoring

- **Files:** one family per module: `src/<component>.ts` (all of its elements), `src/<component>.css`, `src/<component>.stories.ts` (title `Components/<Name>`; import the module itself, e.g. `import './accordion'`).
- **Anatomy:** one element per behavioural Base UI part (`taqwa-accordion` > `taqwa-accordion-item`), purely visual parts (header, indicator, arrow, backdrop, portal) live in the shadow root, exposed with `part="…"` and overridable via named slots (`slot="trigger"`, `slot="icon"`, …).
- **Attributes/properties:** mirror Base UI prop names in camelCase properties and kebab-case attributes (`openOnHover` ↔ `open-on-hover`). State that Base UI exposes as `data-*` (open, checked, disabled, highlighted, orientation) is reflected as attributes on the host so consumers can style it.
- **Events:** lowercase kebab names mirroring Base UI callbacks: `value-change`, `open-change`, `checked-change`, `pressed-change`, … with data in `detail` (`{ value }`, `{ open, reason }`). Dispatch with `bubbles: true, composed: true, cancelable: true`. Calling `preventDefault()` cancels the change, which is how React/controlled usage keeps state. Form controls also fire native-like `input`/`change`.
- **Docs for the manifest:** JSDoc every element class with `@summary`, `@fires`, `@slot`, `@csspart`, `@cssprop`. React wrappers and JSX types are generated from it.
- **Forms:** value controls extend `TaqwaFormControl`; call `commitValue()` on every change, expose a typed `formValue`, and render `controlLabel`, `controlDescription`, `controlInvalid` as `aria-label`, `aria-description`, `aria-invalid` on the focusable element.
- **ARIA:** ids only resolve within one shadow root. Keep id-linked pairs in the same shadow root; for relations between sibling host elements, set roles/states with `ElementInternals` (`internals.role`, `internals.ariaSelected`) or attributes on the light-DOM hosts.
- **Keyboard:** use `nextIndex` / `typeahead` / `isRtl` from `src/internal/a11y.ts` for roving focus, type-to-select and RTL.
- **Popups:** a `popover="manual"` element in the shadow root (top layer), positioned with `anchorPopup` and dismissed with `onDismiss` (`src/internal/popup.ts`). Modal overlays use a native `<dialog>` with `showModal()`.
- **Styling:** tokens are Tailwind theme values: `tq:bg-primary`, `tq:text-foreground`, `tq:bg-secondary`, `tq:bg-muted`, `tq:text-muted-foreground`, `tq:bg-accent`, `tq:border-border`, `tq:border-input`, `tq:bg-destructive`, `tq:rounded-control` (4px), `tq:rounded-surface` (6px), `tq:font-heading` (titles), `tq:font-display`. Utilities: `tq:control-size` (44px → 40px at `md`), `tq:focus-ring`, `tq:glass-surface` (liquid-glass floating surfaces: frosted blur, grain, specular rim via `::after`, so the element must be positioned), `tq:glass-interactive` (hoverable controls with a pointer-tracking specular highlight; set `--_glass-fill` to the resting background, optionally `--_glass-tint`). Text is `tq:text-body tq:md:text-sm`. Spacing is relaxed: 12–16px gaps, 24px surface padding (`tq:p-6`).
- **Motion:** `bindGlassMotion` for hover/press on interactive elements, `animateGlass` for keyboard highlight, `animatePopupIn`/`animatePopupOut` for popups (await the exit before hiding), `animateHeight` for panels (`src/internal/motion.ts`). All respect reduced motion. Never use CSS transitions or Tailwind `transition-*`/`animate-*`.
- **Icons:** `icon(Node)` from `src/internal/icons.ts` with Lucide nodes (re-exported there or imported from `lucide`), always inside an overridable slot.
- **Lifecycle:** bind listeners in `firstUpdated`/`connectedCallback`, release them in `disconnectedCallback`, re-bind on reconnect (see `src/button.ts`).

## Publishing

- Publishing runs only on a published GitHub Release. Its `v<package-version>` tag must exactly match `package.json`; CI then validates, builds, builds Storybook, and publishes with the `NPM_TOKEN` secret.
