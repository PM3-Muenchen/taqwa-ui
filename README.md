# Taqwa UI

Lit web components that port every [Base UI](https://base-ui.com) component, styled with a calm green palette and quiet frosted-glass surfaces. They work in plain HTML, React and Astro, or any other framework.

See [`DESIGN.md`](./DESIGN.md) for the design system (tokens, roles, spacing, motion).

## Install

```sh
pnpm add @pm3/taqwa-ui
```

### Fonts

The package ships no font files. Load Inter (body), Instrument Sans (titles) and Instrument Serif (display) yourself, for example:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&display=swap" />
```

You can also self-host them with Fontsource (`@fontsource-variable/inter`, …) or `next/font`. Override the stacks with `--taqwa-font-body`, `--taqwa-font-heading` and `--taqwa-font-display`.

## Usage

Import everything, or only the components you use:

```ts
import '@pm3/taqwa-ui'; // registers every element
import '@pm3/taqwa-ui/select'; // registers only <taqwa-select> and its parts
```

```html
<taqwa-button variant="secondary">Continue</taqwa-button>
```

Elements render on the client. To hide them until they upgrade:

```css
:not(:defined) { visibility: hidden; }
```

### Events

Events use lowercase kebab-case names that mirror Base UI's callbacks: `value-change`, `open-change`, `checked-change`, `pressed-change`, and so on. The payload is in `event.detail`. Calling `event.preventDefault()` cancels the change, which is how you keep a component controlled. Form controls also fire native `input` and `change` events.

### React

React 19 supports custom elements natively. Add the JSX types once:

```ts
// e.g. src/taqwa.d.ts
import '@pm3/taqwa-ui/jsx';
```

```tsx
import '@pm3/taqwa-ui/select';

<taqwa-select name="fruit" onvalue-change={(e) => setFruit(e.detail.value)}>…</taqwa-select>
```

On React 18, or if you prefer `onValueChange`-style props, use the generated [`@lit/react`](https://lit.dev/docs/frameworks/react/) wrappers:

```tsx
import { Select, SelectItem } from '@pm3/taqwa-ui/react';

<Select name="fruit" onValueChange={(e) => setFruit(e.detail.value)}>
  <SelectItem value="apple">Apple</SelectItem>
</Select>
```

The wrappers are named after the element without the `taqwa-` prefix (`taqwa-alert-dialog` → `AlertDialog`).

### Astro

Register the elements in a client script. The modules are safe to import during SSR, and elements upgrade in the browser:

```astro
<taqwa-dialog>
  <taqwa-button slot="trigger">Open</taqwa-button>
  <span slot="title">Hello</span>
</taqwa-dialog>

<script>
  import '@pm3/taqwa-ui/dialog';
  import '@pm3/taqwa-ui/button';
</script>
```

### Forms and Zod

Form controls are form-associated, so they submit with a native `<form>`. Wrap that form in `taqwa-form` to get field-level errors, server errors, and validation with any [Standard Schema](https://standardschema.dev) library (Zod 4, Valibot, ArkType):

```ts
import { z } from 'zod';

const form = document.querySelector('taqwa-form')!;
form.schema = z.object({ email: z.email(), age: z.number().min(18) });
form.addEventListener('form-submit', (e) => console.log(e.detail.output)); // parsed by the schema
```

```html
<taqwa-form>
  <form>
    <taqwa-field name="email" label="Email"><taqwa-input type="email"></taqwa-input></taqwa-field>
    <taqwa-field name="age" label="Age"><taqwa-number-field></taqwa-number-field></taqwa-field>
    <taqwa-button type="submit">Save</taqwa-button>
  </form>
</taqwa-form>
```

Schema issues are routed to the `taqwa-field` whose `name` matches the issue path; nested paths are joined with dots (`address.city`). Values are typed: number fields give numbers, switches give booleans, and groups give arrays.

## Theming

Every colour, radius and font is a `--taqwa-*` custom property. Set any of them on an ancestor:

```css
:root {
  --taqwa-color-primary: #1f5f19;
  --taqwa-radius-control: 2px;
}
```

Style an element's internals through its parts (`taqwa-button::part(base)`), and replace any icon through its slot.

## Motion

Animations use [Motion](https://motion.dev/) and respect `prefers-reduced-motion`. Interactive controls get a faint wash on hover and press. `taqwa-button` accepts custom animations through `motionOptions`:

```ts
button.motionOptions = { hover: { scale: 1.05 }, press: { scale: 0.96 }, rest: { scale: 1 } };
```

## Development

```sh
pnpm install
pnpm storybook        # http://localhost:6006
pnpm typecheck
pnpm build            # manifest → React wrappers & JSX types → dist
pnpm build-storybook
```

## Publishing

Create a GitHub Release whose tag is `v` followed by the package version, for example `v0.3.0`. The release workflow validates, builds and publishes to npm. Set the repository `NPM_TOKEN` secret to an npm automation token that is authorized to publish `@pm3/taqwa-ui`.
