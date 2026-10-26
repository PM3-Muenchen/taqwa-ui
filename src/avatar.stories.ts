import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './avatar';
import type { TaqwaAvatar } from './avatar';

type Args = Pick<TaqwaAvatar, 'src' | 'alt' | 'delay'> & { initials: string };

const meta = {
  title: 'Components/Avatar',
  component: 'taqwa-avatar',
  parameters: {
    layout: 'centered',
  },
  args: {
    src: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80',
    alt: 'Profile picture of Lina Tahir',
    delay: 0,
    initials: 'LT',
  },
  argTypes: {
    delay: { control: { type: 'number', min: 0, step: 100 } },
  },
  render: ({ src, alt, delay, initials }) => html`
    <taqwa-avatar .src=${src} .alt=${alt} .delay=${delay}>${initials}</taqwa-avatar>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const InitialsFallback: Story = {
  args: {
    src: 'https://example.invalid/missing.png',
  },
};

export const IconFallback: Story = {
  args: {
    src: undefined,
    initials: '',
  },
  render: () => html`<taqwa-avatar></taqwa-avatar>`,
};

export const DelayedFallback: Story = {
  args: {
    src: 'https://example.invalid/slow.png',
    delay: 600,
  },
};

export const Sizes: Story = {
  args: {
    src: undefined,
  },
  render: () => html`
    <div style="display: flex; align-items: center; gap: 1rem">
      <taqwa-avatar style="--taqwa-avatar-size: 2rem">SA</taqwa-avatar>
      <taqwa-avatar>LT</taqwa-avatar>
      <taqwa-avatar style="--taqwa-avatar-size: 4rem">MK</taqwa-avatar>
    </div>
  `,
};
