import type { Preview } from '@storybook/web-components-vite';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    // The solid Ivory page is painted by preview-head.html.
    backgrounds: { disable: true },
  },
  // Same steps as the Figma "Taqwa/Padding" modes.
  globalTypes: {
    padding: {
      description: 'Component padding (--taqwa-padding-scale)',
      toolbar: {
        title: 'Padding',
        icon: 'expand',
        dynamicTitle: true,
        items: [
          { value: '0.75', title: 'Compact (0.75)' },
          { value: '1', title: 'Default (1)' },
          { value: '1.25', title: 'Comfortable (1.25)' },
          { value: '1.5', title: 'Spacious (1.5)' },
        ],
      },
    },
  },
  initialGlobals: { padding: '1' },
  decorators: [
    (story, { globals }) => {
      document.documentElement.style.setProperty('--taqwa-padding-scale', globals.padding ?? '1');
      return story();
    },
  ],
};

export default preview;
