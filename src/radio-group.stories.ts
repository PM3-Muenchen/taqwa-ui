import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './radio-group';

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

type Args = {
  value: string | null;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
};

const meta = {
  title: 'Components/Radio Group',
  component: 'taqwa-radio-group',
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 'pro',
    disabled: false,
    required: false,
    readOnly: false,
  },
  render: ({ value, disabled, required, readOnly }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-radio-group
        name="plan"
        aria-label="Plan"
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?read-only=${readOnly}
      >
        <taqwa-radio value="free">Free</taqwa-radio>
        <taqwa-radio value="pro">Pro</taqwa-radio>
        <taqwa-radio value="team">Team</taqwa-radio>
      </taqwa-radio-group>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Unselected: Story = {
  args: {
    value: null,
    required: true,
  },
};

export const DisabledOption: Story = {
  render: () => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-radio-group name="storage" aria-label="Storage" value="ssd">
        <taqwa-radio value="ssd">SSD</taqwa-radio>
        <taqwa-radio value="hdd" disabled>HDD (sold out)</taqwa-radio>
      </taqwa-radio-group>
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
