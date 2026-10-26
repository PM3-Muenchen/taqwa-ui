import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './separator';
import type { TaqwaSeparator } from './separator';

type Args = Pick<TaqwaSeparator, 'orientation'>;

const meta = {
  title: 'Components/Separator',
  component: 'taqwa-separator',
  parameters: {
    layout: 'centered',
  },
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: ({ orientation }) =>
    orientation === 'vertical'
      ? html`<div style="display: flex; align-items: stretch; gap: 1rem; height: 2.5rem; font-size: 0.875rem">
          <span>Home</span>
          <taqwa-separator orientation="vertical"></taqwa-separator>
          <span>Pricing</span>
        </div>`
      : html`<div style="width: 20rem; display: grid; gap: 1rem; font-size: 0.875rem">
          <span>Account settings</span>
          <taqwa-separator orientation="horizontal"></taqwa-separator>
          <span>Notifications</span>
        </div>`,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};
