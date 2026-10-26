import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './navigation-menu';

const meta = {
  title: 'Components/Navigation Menu',
  component: 'taqwa-navigation-menu',
  parameters: { layout: 'fullscreen' },
  render: () => html`
    <div style="padding: 2.5rem; min-height: 22rem;">
      <taqwa-navigation-menu>
        <taqwa-navigation-menu-item>
          <taqwa-button slot="trigger" variant="tertiary">Product</taqwa-button>
          <div style="display: grid; gap: 0.25rem; min-width: 14rem;">
            <taqwa-navigation-menu-link href="#" active>Overview</taqwa-navigation-menu-link>
            <taqwa-navigation-menu-link href="#">Pricing</taqwa-navigation-menu-link>
            <taqwa-navigation-menu-link href="#">Changelog</taqwa-navigation-menu-link>
          </div>
        </taqwa-navigation-menu-item>
        <taqwa-navigation-menu-item>
          <taqwa-button slot="trigger" variant="tertiary">Learn</taqwa-button>
          <div style="display: grid; gap: 0.25rem; min-width: 14rem;">
            <taqwa-navigation-menu-link href="#">Documentation</taqwa-navigation-menu-link>
            <taqwa-navigation-menu-link href="#">Tutorials</taqwa-navigation-menu-link>
            <taqwa-navigation-menu-link href="#">Examples</taqwa-navigation-menu-link>
          </div>
        </taqwa-navigation-menu-item>
        <taqwa-navigation-menu-item>
          <taqwa-navigation-menu-link href="#">Community</taqwa-navigation-menu-link>
        </taqwa-navigation-menu-item>
      </taqwa-navigation-menu>
    </div>
  `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
