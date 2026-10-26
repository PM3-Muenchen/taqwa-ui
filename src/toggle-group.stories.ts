import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { Bold, Italic, TextAlignCenter, TextAlignEnd, TextAlignStart, Underline } from 'lucide';
import { icon } from './internal/icons';
import './toggle';
import './toggle-group';
import type { TaqwaToggleGroup } from './toggle-group';

type Args = Pick<TaqwaToggleGroup, 'multiple' | 'disabled' | 'orientation' | 'loopFocus'> & {
  value: string[];
};

const alignments = [
  { value: 'start', label: 'Align start', node: TextAlignStart },
  { value: 'center', label: 'Align center', node: TextAlignCenter },
  { value: 'end', label: 'Align end', node: TextAlignEnd },
];

const formats = [
  { value: 'bold', label: 'Bold', node: Bold },
  { value: 'italic', label: 'Italic', node: Italic },
  { value: 'underline', label: 'Underline', node: Underline },
];

const meta = {
  title: 'Components/Toggle Group',
  component: 'taqwa-toggle-group',
  parameters: {
    layout: 'centered',
  },
  args: {
    value: ['start'],
    multiple: false,
    disabled: false,
    orientation: 'horizontal',
    loopFocus: true,
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  render: ({ value, multiple, disabled, orientation, loopFocus }) => html`
    <taqwa-toggle-group
      aria-label="Text alignment"
      .value=${value}
      ?multiple=${multiple}
      ?disabled=${disabled}
      orientation=${orientation}
      loop-focus=${String(loopFocus)}
    >
      ${alignments.map(
        (item) => html`<taqwa-toggle value=${item.value} aria-label=${item.label}>${icon(item.node)}</taqwa-toggle>`,
      )}
    </taqwa-toggle-group>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Single: Story = {};

export const Multiple: Story = {
  render: () => html`
    <taqwa-toggle-group aria-label="Text formatting" multiple .value=${['bold', 'italic']}>
      ${formats.map(
        (item) => html`<taqwa-toggle value=${item.value} aria-label=${item.label}>${icon(item.node)}</taqwa-toggle>`,
      )}
    </taqwa-toggle-group>
  `,
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabels: Story = {
  render: () => html`
    <taqwa-toggle-group aria-label="Billing period" .value=${['monthly']}>
      <taqwa-toggle value="monthly">Monthly</taqwa-toggle>
      <taqwa-toggle value="yearly">Yearly</taqwa-toggle>
      <taqwa-toggle value="lifetime">Lifetime</taqwa-toggle>
    </taqwa-toggle-group>
  `,
};

export const OnColorfulBackground: Story = {
  render: () => html`
    <div
      style="padding: 2rem; border-radius: 1rem; background: linear-gradient(135deg, #22d3ee, #84cc16 50%, #facc15);"
    >
      <taqwa-toggle-group aria-label="Text formatting" multiple .value=${['bold']}>
        ${formats.map(
          (item) => html`<taqwa-toggle value=${item.value} aria-label=${item.label}>${icon(item.node)}</taqwa-toggle>`,
        )}
      </taqwa-toggle-group>
    </div>
  `,
};
