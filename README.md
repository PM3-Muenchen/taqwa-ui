# Taqwa UI

An React component library built on [Base UI](https://base-ui.com/).

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

```tsx
import { Button } from '@pm3/taqwa-ui';

export function Example() {
  return <Button variant="secondary">Continue</Button>;
}
```

Import the stylesheet when Taqwa component styles are introduced:

```ts
import '@pm3/taqwa-ui/styles.css';
```

Taqwa ships Button styles but no CSS reset. Component classes use the `.taqwa-*` namespace and Tailwind utilities are compiled with the `tq:` prefix, preventing collisions with a consuming project's Tailwind classes and variables.

## Extending components

`Button` provides `primary`, `secondary`, and `tertiary` variants. Pass `className` to add or override styles; Taqwa components merge class names through `cn`.

```tsx
import { Button, cn } from '@pm3/taqwa-ui';
import { ArrowRight } from 'lucide-react';

<Button className={cn('w-full')}>
  Continue <ArrowRight aria-hidden="true" size={16} />
</Button>;
```

Use `BaseButton` when raw Base UI behavior without Taqwa variants is required. Lucide remains a direct dependency so applications import only the named icons they use.

## Publishing

Create a GitHub Release whose tag matches `v` plus the package version, for example `v0.1.0`. The release workflow validates, builds, and publishes to npm. Set the repository `NPM_TOKEN` secret to an npm automation token authorized to publish `@pm3/taqwa-ui`.
