import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './checkbox-group';
import './checkbox';

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

type Args = {
  disabled: boolean;
  required: boolean;
};

const meta = {
  title: 'Components/Checkbox Group',
  component: 'taqwa-checkbox-group',
  parameters: {
    layout: 'centered',
  },
  args: {
    disabled: false,
    required: false,
  },
  render: ({ disabled, required }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-checkbox-group name="fruit" aria-label="Fruit" ?disabled=${disabled} ?required=${required}>
        <taqwa-checkbox parent>All fruit</taqwa-checkbox>
        <taqwa-checkbox value="apple" checked>Apple</taqwa-checkbox>
        <taqwa-checkbox value="pear">Pear</taqwa-checkbox>
        <taqwa-checkbox value="plum">Plum</taqwa-checkbox>
      </taqwa-checkbox-group>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};
