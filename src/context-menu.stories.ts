import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './context-menu';
import './menu';

type Args = { disabled: boolean };

const meta = {
  title: 'Components/Context Menu',
  component: 'taqwa-context-menu',
  parameters: { layout: 'centered' },
  args: {
    disabled: false,
  },
  render: ({ disabled }) => html`
    <div style="padding: 2.5rem; border-radius: 0.5rem; background: linear-gradient(135deg, #f97316, #ec4899 45%, #6366f1);">
      <taqwa-context-menu ?disabled=${disabled}>
        <div slot="trigger" style="width: 16rem">Right click here (or long press on touch)</div>
        <taqwa-menu-item>Add to library</taqwa-menu-item>
        <taqwa-menu>
          <taqwa-menu-item slot="trigger">Add to playlist</taqwa-menu-item>
          <taqwa-menu-item>Get up!</taqwa-menu-item>
          <taqwa-menu-item>Inside out</taqwa-menu-item>
          <taqwa-menu-separator></taqwa-menu-separator>
          <taqwa-menu-item>New playlist…</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-item>Play next</taqwa-menu-item>
        <taqwa-menu-item>Play last</taqwa-menu-item>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-checkbox-item checked>Show lyrics</taqwa-menu-checkbox-item>
        <taqwa-menu-item disabled>Favorite</taqwa-menu-item>
        <taqwa-menu-item>Share</taqwa-menu-item>
      </taqwa-context-menu>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
