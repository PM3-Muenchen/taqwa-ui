import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './collapsible';
import type { TaqwaCollapsible } from './collapsible';

type Args = Pick<TaqwaCollapsible, 'open' | 'disabled'> & {
  label: string;
};

const meta = {
  title: 'Components/Collapsible',
  component: 'taqwa-collapsible',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Recovery keys',
    open: false,
    disabled: false,
  },
  render: ({ label, open, disabled }) => html`
    <div style="width: min(24rem, 90vw)">
      <taqwa-collapsible ?open=${open} ?disabled=${disabled}>
        <span slot="trigger">${label}</span>
        <ul>
          <li>alien-bean-pasta</li>
          <li>wild-irish-burrito</li>
          <li>horse-battery-staple</li>
        </ul>
      </taqwa-collapsible>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
