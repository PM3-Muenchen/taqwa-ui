import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './drawer';
import './button';
import type { TaqwaDrawer } from './drawer';

const stage = `min-height: 100vh; display: grid; place-items: center; padding: 2rem; box-sizing: border-box;
  background:
    radial-gradient(circle at 20% 25%, #fbcfe8 0, transparent 40%),
    radial-gradient(circle at 80% 15%, #bae6fd 0, transparent 42%),
    radial-gradient(circle at 75% 85%, #bbf7d0 0, transparent 46%),
    linear-gradient(120deg, #7c3aed 0%, #db2777 50%, #f97316 100%);`;

type Args = Pick<TaqwaDrawer, 'side' | 'snapPoints' | 'snapPoint'> & {
  title: string;
  description: string;
};

const items = Array.from({ length: 10 }, (_, i) => html`<li>Activity item ${i + 1}</li>`);

const meta = {
  title: 'Components/Drawer',
  component: 'taqwa-drawer',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    side: 'bottom',
    snapPoints: [],
    snapPoint: undefined,
    title: 'Share project',
    description: 'Anyone with the link can view this project.',
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'left', 'right'],
    },
  },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
  render: ({ side, snapPoints, snapPoint, title, description }) => html`
    <taqwa-drawer side=${side} .snapPoints=${snapPoints} .snapPoint=${snapPoint}>
      <taqwa-button slot="trigger">Open ${side} drawer</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <ul>${items}</ul>
      <taqwa-button slot="close" variant="secondary">Done</taqwa-button>
    </taqwa-drawer>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Bottom: Story = {};

export const Top: Story = {
  args: {
    side: 'top',
    title: 'Notifications',
    description: 'You are all caught up.',
  },
};

export const Left: Story = {
  args: {
    side: 'left',
    title: 'Navigation',
    description: 'Jump to a section of the app.',
  },
};

export const Right: Story = {
  args: {
    side: 'right',
    title: 'Settings',
    description: 'Changes apply to your account.',
  },
};

export const SnapPoints: Story = {
  args: {
    snapPoints: [0.35, 0.7, 1],
    snapPoint: 0.35,
    title: 'Trip details',
    description: 'Drag the sheet to resize it, or drag it down to dismiss.',
  },
};

export const PixelSnapPoints: Story = {
  args: {
    side: 'top',
    snapPoints: ['160px', '20rem'],
    snapPoint: '160px',
    title: 'Quick actions',
    description: 'Snap points also accept px and rem.',
  },
};
