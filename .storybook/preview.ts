import { withThemeByDataAttribute } from '@storybook/addon-themes';

export default {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    controls: { expanded: true },
  },
};
