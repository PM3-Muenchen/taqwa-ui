import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/styles.css';

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
