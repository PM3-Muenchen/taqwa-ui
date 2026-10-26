import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './alert-dialog';
import './button';

const stage = `min-height: 100vh; display: grid; place-items: center; padding: 2rem; box-sizing: border-box;
  background:
    radial-gradient(circle at 15% 80%, #fca5a5 0, transparent 40%),
    radial-gradient(circle at 85% 20%, #fde68a 0, transparent 42%),
    radial-gradient(circle at 60% 60%, #a78bfa 0, transparent 48%),
    linear-gradient(160deg, #2a7221 0%, #0f766e 50%, #1e3a8a 100%);`;

type Args = {
  title: string;
  description: string;
  confirm: string;
};

const meta = {
  title: 'Components/Alert Dialog',
  component: 'taqwa-alert-dialog',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Discard draft?',
    description: 'This action cannot be undone.',
    confirm: 'Discard',
  },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
  render: ({ title, description, confirm }) => html`
    <taqwa-alert-dialog>
      <taqwa-button slot="trigger" variant="destructive">Discard draft</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <taqwa-button slot="close" variant="secondary">Cancel</taqwa-button>
      <taqwa-button slot="close" variant="destructive">${confirm}</taqwa-button>
    </taqwa-alert-dialog>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Confirm: Story = {
  args: {
    title: 'Publish changes?',
    description: 'Your edits go live for everyone on the team.',
    confirm: 'Publish',
  },
  render: ({ title, description, confirm }) => html`
    <taqwa-alert-dialog>
      <taqwa-button slot="trigger">Publish</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <taqwa-button slot="close" variant="tertiary">Not yet</taqwa-button>
      <taqwa-button slot="close">${confirm}</taqwa-button>
    </taqwa-alert-dialog>
  `,
};
