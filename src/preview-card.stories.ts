import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './preview-card';
import type { TaqwaPreviewCard } from './preview-card';

type Args = Pick<TaqwaPreviewCard, 'side' | 'align' | 'sideOffset' | 'arrow'> & {
  label: string;
  href: string;
};

const previewCard = ({ label, href, side, align, sideOffset, arrow }: Args) => html`
  <taqwa-preview-card side=${side} align=${align} side-offset=${sideOffset} ?arrow=${arrow}>
    <a slot="trigger" href=${href}>${label}</a>
    <strong>Typography</strong> is the art and science of arranging type to make written language clear, visually
    appealing, and effective in communication.
  </taqwa-preview-card>
`;

const inText = (args: Args) => html`
  <p style="max-width: 28rem; font-size: 1rem; line-height: 1.6;">
    The principles of good design still hold in the digital age, from the spacing of a layout to the
    ${previewCard(args)} that carries the words.
  </p>
`;

const meta = {
  title: 'Components/Preview Card',
  component: 'taqwa-preview-card',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'typography',
    href: 'https://en.wikipedia.org/wiki/Typography',
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    arrow: false,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  render: inText,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const WithArrow: Story = {
  args: {
    arrow: true,
    side: 'top',
  },
};

export const Sides: Story = {
  render: (args) => html`
    <div style="display: grid; grid-template-columns: repeat(2, auto); gap: 4rem 6rem; padding: 6rem;">
      ${(['top', 'right', 'bottom', 'left'] as const).map((side) => previewCard({ ...args, side, label: side }))}
    </div>
  `,
};

export const OnColour: Story = {
  render: (args) => html`
    <div
      style="padding: 8rem 4rem; border-radius: 1rem;"
    >
      ${inText(args)}
    </div>
  `,
};
