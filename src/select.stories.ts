import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './select';
import type { TaqwaSelect } from './select';

type Args = Pick<TaqwaSelect, 'placeholder' | 'disabled' | 'required' | 'readOnly' | 'multiple' | 'value'>;

const fruits = ['Gala', 'Fuji', 'Honeycrisp', 'Granny Smith', 'Pink Lady'];

const items = (names: string[]) => names.map((name) => html`<taqwa-select-item value=${name}>${name}</taqwa-select-item>`);

const onSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify(
    [...new FormData(form)].map(([name, value]) => [name, value]),
  );
};

const meta = {
  title: 'Components/Select',
  component: 'taqwa-select',
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Pick an apple',
    value: '',
    disabled: false,
    required: false,
    readOnly: false,
    multiple: false,
  },
  render: ({ placeholder, value, disabled, required, readOnly, multiple }) => html`
    <taqwa-select
      name="apple"
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?readonly=${readOnly}
      ?multiple=${multiple}
    >
      ${items(fruits)}
    </taqwa-select>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Preselected: Story = {
  args: {
    value: 'Fuji',
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    placeholder: 'Pick apples',
    value: ['Gala', 'Pink Lady'],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Fuji',
  },
};

export const Grouped: Story = {
  render: () => html`
    <taqwa-select name="produce" placeholder="Pick produce">
      <taqwa-select-group label="Fruits">${items(['Apple', 'Banana', 'Orange'])}</taqwa-select-group>
      <taqwa-select-group label="Vegetables">${items(['Carrot', 'Lettuce', 'Spinach'])}</taqwa-select-group>
    </taqwa-select>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form style="display: grid; gap: 1rem; width: 16rem" @submit=${onSubmit}>
      <taqwa-select name="apple" placeholder="Pick an apple" required>${items(fruits)}</taqwa-select>
      <taqwa-select name="snack" placeholder="Pick snacks" multiple>${items(['Chips', 'Nuts', 'Fruit'])}</taqwa-select>
      <taqwa-button type="submit">Submit</taqwa-button>
      <output style="font-family: monospace; font-size: 0.75rem; overflow-wrap: anywhere"></output>
    </form>
  `,
};

export const LiquidGlass: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => html`
    <div
      style="display: grid; place-items: center; min-height: 28rem; padding: 3rem;"
    >
      <taqwa-select name="apple" placeholder="Pick an apple">${items(fruits)}</taqwa-select>
    </div>
  `,
};
