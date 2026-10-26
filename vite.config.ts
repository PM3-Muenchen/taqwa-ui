import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: (id) =>
        id === 'lit' ||
        id.startsWith('lit/') ||
        id.startsWith('@lit/') ||
        id === 'motion' ||
        id.startsWith('motion/'),
    },
  },
});
