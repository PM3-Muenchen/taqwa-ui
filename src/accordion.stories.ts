import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './accordion';
import type { TaqwaAccordion } from './accordion';

type Args = Pick<TaqwaAccordion, 'value' | 'multiple' | 'disabled'> & {
  disabledItem: boolean;
};

const items = [
  { value: 'shipping', title: 'How long does shipping take?', body: 'Standard shipping takes 3–5 business days. Express arrives in 1–2.' },
  { value: 'returns', title: 'What is your return policy?', body: 'Return any item within 30 days of delivery.' },
  { value: 'international', title: 'Do you ship internationally?', body: 'Yes, to over 40 countries.' },
];

const meta = {
  title: 'Components/Accordion',
  component: 'taqwa-accordion',
  parameters: {
    layout: 'centered',
  },
  args: {
    value: [],
    multiple: false,
    disabled: false,
    disabledItem: false,
  },
  argTypes: {
    value: { control: 'object' },
  },
  render: ({ value, multiple, disabled, disabledItem }) => html`
    <div style="width: min(28rem, 90vw)">
      <taqwa-accordion .value=${value} ?multiple=${multiple} ?disabled=${disabled}>
        ${items.map(
          (item) => html`
            <taqwa-accordion-item value=${item.value} ?disabled=${disabledItem && item.value === 'returns'}>
              <span slot="trigger">${item.title}</span>
              <p>${item.body}</p>
            </taqwa-accordion-item>
          `,
        )}
      </taqwa-accordion>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const OpenByDefault: Story = {
  args: {
    value: ['returns'],
  },
};

export const Multiple: Story = {
  args: {
    value: ['shipping', 'returns'],
    multiple: true,
  },
};

export const DisabledItem: Story = {
  args: {
    disabledItem: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
