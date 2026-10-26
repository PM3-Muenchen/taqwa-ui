# Taqwa UI

A web component library built with [Lit](https://lit.dev/). Works in any framework or plain HTML.

## Development

```sh
pnpm install
pnpm storybook
```

Storybook runs with hot reload at `http://localhost:6006`.

```sh
pnpm typecheck
pnpm build
pnpm build-storybook
```

## Usage

Importing the package registers every element:

```ts
import '@pm3/taqwa-ui';
```

```html
<taqwa-button variant="secondary">Continue</taqwa-button>
```

Styles ship inside each component's Shadow DOM, so there is no stylesheet to import and no CSS reset. Internal styles use `.taqwa-*` classes and `tq:`-prefixed Tailwind utilities.

## Button

| Attribute  | Values                               | Default   |
| ---------- | ------------------------------------ | --------- |
| `variant`  | `primary`, `secondary`, `tertiary`   | `primary` |
| `type`     | `button`, `submit`, `reset`          | `button`  |
| `disabled` | boolean                              | `false`   |

`<taqwa-button type="submit">` submits (and `type="reset"` resets) its enclosing `<form>`.

## Extending components

Style the inner element through its `base` part:

```css
taqwa-button::part(base) {
  width: 100%;
}
```

Slot any content, such as icons:

```html
<taqwa-button>
  Continue <svg aria-hidden="true">…</svg>
</taqwa-button>
```

## Motion

`taqwa-button` includes subtle hover and press animations powered by [Motion](https://motion.dev/). Customize them with the `motionOptions` property:

```ts
document.querySelector('taqwa-button')!.motionOptions = {
  hover: { scale: 1.05 },
  press: { scale: 0.96 },
  rest: { scale: 1 }, // state restored when hover/press ends
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};
```

The default animations respect the user's reduced-motion preference. Explicit `motionOptions` take precedence.

## Publishing

Create a GitHub Release whose tag matches `v` plus the package version, for example `v0.2.0`. The release workflow validates, builds, and publishes to npm. Set the repository `NPM_TOKEN` secret to an npm automation token authorized to publish `@pm3/taqwa-ui`.
