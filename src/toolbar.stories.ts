import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { Bold, Copy, Italic, Scissors, TextAlignCenter, TextAlignEnd, TextAlignStart, Underline } from 'lucide';
import { icon } from './internal/icons';
import './button';
import './toggle';
import './toggle-group';
import './toolbar';
import type { TaqwaToolbar } from './toolbar';

type Args = Pick<TaqwaToolbar, 'orientation' | 'loopFocus'>;

const meta = {
  title: 'Components/Toolbar',
  component: 'taqwa-toolbar',
  parameters: {
    layout: 'centered',
  },
  args: {
    orientation: 'horizontal',
    loopFocus: true,
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  render: ({ orientation, loopFocus }) => html`
    <taqwa-toolbar aria-label="Text editing" orientation=${orientation} loop-focus=${String(loopFocus)}>
      <taqwa-toggle-group aria-label="Alignment" orientation=${orientation}>
        <taqwa-toggle value="start" aria-label="Align start">${icon(TextAlignStart)}</taqwa-toggle>
        <taqwa-toggle value="center" aria-label="Align center">${icon(TextAlignCenter)}</taqwa-toggle>
        <taqwa-toggle value="end" aria-label="Align end">${icon(TextAlignEnd)}</taqwa-toggle>
      </taqwa-toggle-group>
      <taqwa-toolbar-separator></taqwa-toolbar-separator>
      <taqwa-toolbar-group aria-label="Formatting">
        <taqwa-toggle value="bold" aria-label="Bold">${icon(Bold)}</taqwa-toggle>
        <taqwa-toggle value="italic" aria-label="Italic">${icon(Italic)}</taqwa-toggle>
        <taqwa-toggle value="underline" aria-label="Underline">${icon(Underline)}</taqwa-toggle>
      </taqwa-toolbar-group>
      <taqwa-toolbar-separator></taqwa-toolbar-separator>
      <taqwa-button variant="tertiary" aria-label="Cut">${icon(Scissors)}</taqwa-button>
      <taqwa-button variant="tertiary" aria-label="Copy">${icon(Copy)}</taqwa-button>
      <taqwa-toolbar-separator></taqwa-toolbar-separator>
      <a href="#">Edited 51m ago</a>
    </taqwa-toolbar>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const OnColorfulBackground: Story = {
  render: () => html`
    <div
      style="padding: 2.5rem; border-radius: 1rem;"
    >
      <taqwa-toolbar aria-label="Text editing">
        <taqwa-toggle-group aria-label="Alignment">
          <taqwa-toggle value="start" aria-label="Align start">${icon(TextAlignStart)}</taqwa-toggle>
          <taqwa-toggle value="center" aria-label="Align center">${icon(TextAlignCenter)}</taqwa-toggle>
          <taqwa-toggle value="end" aria-label="Align end">${icon(TextAlignEnd)}</taqwa-toggle>
        </taqwa-toggle-group>
        <taqwa-toolbar-separator></taqwa-toolbar-separator>
        <taqwa-button variant="tertiary" aria-label="Copy">${icon(Copy)}</taqwa-button>
        <taqwa-button variant="tertiary" aria-label="Cut">${icon(Scissors)}</taqwa-button>
      </taqwa-toolbar>
    </div>
  `,
};
