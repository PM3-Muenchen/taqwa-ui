import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './switch';
import type { TaqwaSwitch } from './switch';

type Args = Pick<TaqwaSwitch, 'checked' | 'disabled' | 'required' | 'readOnly'> & {
  label: string;
};

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

const meta = {
  title: 'Components/Switch',
  component: 'taqwa-switch',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Notifications',
    checked: false,
    disabled: false,
    required: false,
    readOnly: false,
  },
  render: ({ label, checked, disabled, required, readOnly }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-switch
        name="notifications"
        ?checked=${checked}
        ?disabled=${disabled}
        ?required=${required}
        ?read-only=${readOnly}
        >${label}</taqwa-switch
      >
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const On: Story = {
  args: {
    checked: true,
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
