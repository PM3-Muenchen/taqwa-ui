import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './popover';
import type { TaqwaPopover } from './popover';

type Args = Pick<TaqwaPopover, 'side' | 'align' | 'sideOffset' | 'arrow' | 'openOnHover'> & {
  label: string;
  title: string;
  description: string;
};

const popover = ({ label, title, description, side, align, sideOffset, arrow, openOnHover }: Args) => html`
  <taqwa-popover
    side=${side}
    align=${align}
    side-offset=${sideOffset}
    ?arrow=${arrow}
    ?open-on-hover=${openOnHover}
  >
    <taqwa-button slot="trigger" variant="secondary">${label}</taqwa-button>
    <span slot="title">${title}</span>
    <span slot="description">${description}</span>
    <taqwa-button slot="close" variant="tertiary">Close</taqwa-button>
  </taqwa-popover>
`;

const meta = {
  title: 'Components/Popover',
  component: 'taqwa-popover',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Notifications',
    title: 'Notifications',
    description: 'You are all caught up. Good job!',
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    arrow: false,
    openOnHover: false,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  render: popover,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Sides: Story = {
  render: (args) => html`
    <div style="display: grid; grid-template-columns: repeat(2, auto); gap: 4rem 6rem; padding: 6rem;">
      ${(['top', 'right', 'bottom', 'left'] as const).map((side) => popover({ ...args, side, label: side }))}
    </div>
  `,
};

export const Alignment: Story = {
  render: (args) => html`
    <div style="display: flex; gap: 4rem; padding: 4rem;">
      ${(['start', 'center', 'end'] as const).map((align) => popover({ ...args, align, label: align }))}
    </div>
  `,
};

export const WithArrow: Story = {
  args: {
    arrow: true,
  },
};

export const OpenOnHover: Story = {
  args: {
    openOnHover: true,
  },
};

export const OnColour: Story = {
  render: (args) => html`
    <div
      style="padding: 6rem 4rem; border-radius: 1rem;"
    >
      ${popover(args)}
    </div>
  `,
};
