import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './number-field';
import type { TaqwaNumberField } from './number-field';

type Args = Pick<TaqwaNumberField, 'value' | 'min' | 'max' | 'step' | 'disabled' | 'required' | 'readOnly'> & {
  label: string;
};

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

const meta = {
  title: 'Components/Number Field',
  component: 'taqwa-number-field',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Quantity',
    value: 1,
    min: 0,
    max: 10,
    step: 1,
    disabled: false,
    required: false,
    readOnly: false,
  },
  render: ({ label, value, min, max, step, disabled, required, readOnly }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-number-field
        name="quantity"
        aria-label=${label}
        .value=${value}
        .min=${min}
        .max=${max}
        .step=${step}
        ?disabled=${disabled}
        ?required=${required}
        ?read-only=${readOnly}
      ></taqwa-number-field>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    value: null,
    required: true,
  },
};

export const Currency: Story = {
  render: () => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-number-field
        name="price"
        aria-label="Price"
        .value=${19.5}
        .min=${0}
        .format=${{ style: 'currency', currency: 'USD' }}
        .largeStep=${5}
      ></taqwa-number-field>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};
