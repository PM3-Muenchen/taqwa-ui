import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: (id) =>
        [
          'class-variance-authority',
          'clsx',
          'tailwind-merge',
        ].includes(id) ||
        id === '@base-ui/react' ||
        id.startsWith('@base-ui/react/') ||
        id === 'react' ||
        id.startsWith('react/') ||
        id === 'react-dom' ||
        id.startsWith('react-dom/'),
    },
  },
});
