import { readdirSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// One entry per public module (`src/<name>.ts`) so consumers can import `@pm3/taqwa-ui/<name>`.
const entries = Object.fromEntries(
  readdirSync('src')
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.stories.ts') && !file.endsWith('.d.ts'))
    .map((file) => [file.slice(0, -3), `src/${file}`]),
);

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) =>
        id === 'lit' ||
        id.startsWith('lit/') ||
        id.startsWith('@lit/') ||
        id === 'motion' ||
        id.startsWith('motion/') ||
        id.startsWith('@floating-ui/') ||
        id === 'react' ||
        id.startsWith('react/'),
    },
  },
});
