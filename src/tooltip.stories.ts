import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './tooltip';
import type { TaqwaTooltip } from './tooltip';

type Args = Pick<TaqwaTooltip, 'side' | 'align' | 'sideOffset' | 'arrow'> & {
  label: string;
  text: string;
};

const tooltip = ({ label, text, side, align, sideOffset, arrow }: Args) => html`
  <taqwa-tooltip side=${side} align=${align} side-offset=${sideOffset} ?arrow=${arrow}>
    <taqwa-button slot="trigger" variant="tertiary">${label}</taqwa-button>
    ${text}
  </taqwa-tooltip>
`;

const meta = {
  title: 'Components/Tooltip',
  component: 'taqwa-tooltip',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Bold',
    text: 'Bold',
    side: 'top',
    align: 'center',
    sideOffset: 8,
    arrow: false,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  render: tooltip,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Sides: Story = {
  render: (args) => html`
    <div style="display: grid; grid-template-columns: repeat(2, auto); gap: 4rem 6rem; padding: 6rem;">
      ${(['top', 'right', 'bottom', 'left'] as const).map((side) => tooltip({ ...args, side, label: side, text: `On ${side}` }))}
    </div>
  `,
};

export const WithArrow: Story = {
  args: {
    arrow: true,
  },
};

export const Grouped: Story = {
  render: (args) => html`
    <div style="display: flex; gap: 1rem;">
      ${['Bold', 'Italic', 'Underline'].map((label) => tooltip({ ...args, label, text: label }))}
    </div>
  `,
};

export const OnColour: Story = {
  render: (args) => html`
    <div
      style="padding: 6rem 4rem; border-radius: 1rem; background: linear-gradient(135deg, #2a7221, #cfee9e 45%, #ff8a65 75%, #7e57c2);"
    >
      ${tooltip(args)}
    </div>
  `,
};
