import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  framework: '@storybook/web-components-vite',
  addons: ['@storybook/addon-a11y', '@storybook/addon-themes'],
};

export default config;
