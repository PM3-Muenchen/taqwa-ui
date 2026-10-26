import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './checkbox';
import type { TaqwaCheckbox } from './checkbox';

type Args = Pick<TaqwaCheckbox, 'checked' | 'indeterminate' | 'disabled' | 'required' | 'readOnly'> & {
  label: string;
};

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

const meta = {
  title: 'Components/Checkbox',
  component: 'taqwa-checkbox',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Accept terms and conditions',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    readOnly: false,
  },
  render: ({ label, checked, indeterminate, disabled, required, readOnly }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-checkbox
        name="terms"
        ?checked=${checked}
        ?indeterminate=${indeterminate}
        ?disabled=${disabled}
        ?required=${required}
        ?read-only=${readOnly}
        >${label}</taqwa-checkbox
      >
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    checked: true,
  },
};
