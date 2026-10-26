import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './combobox';
import type { TaqwaCombobox } from './combobox';

type Args = Pick<TaqwaCombobox, 'placeholder' | 'disabled' | 'required' | 'readOnly' | 'multiple' | 'value'>;

const fruits = [
  'Apple',
  'Banana',
  'Orange',
  'Pineapple',
  'Grape',
  'Mango',
  'Strawberry',
  'Blueberry',
  'Raspberry',
  'Cherry',
  'Peach',
  'Pear',
  'Kiwi',
  'Watermelon',
];

const items = (names: string[]) =>
  names.map((name) => html`<taqwa-combobox-item value=${name}>${name}</taqwa-combobox-item>`);

const onSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
};

const users = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton', 'Tim Berners-Lee'];

// Simulates a server search: the consumer replaces the items as the user types.
const searchUsers = async (event: Event) => {
  const combobox = event.currentTarget as TaqwaCombobox;
  const query = (event.composedPath()[0] as HTMLInputElement).value.toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, 400));
  combobox.replaceChildren(
    ...users
      .filter((user) => user.toLowerCase().includes(query))
      .map((user) => {
        const item = document.createElement('taqwa-combobox-item');
        item.value = user;
        item.textContent = user;
        return item;
      }),
  );
};

const meta = {
  title: 'Components/Combobox',
  component: 'taqwa-combobox',
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'e.g. Apple',
    value: '',
    disabled: false,
    required: false,
    readOnly: false,
    multiple: false,
  },
  render: ({ placeholder, value, disabled, required, readOnly, multiple }) => html`
    <taqwa-combobox
      name="fruit"
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?readonly=${readOnly}
      ?multiple=${multiple}
    >
      ${items(fruits)}
    </taqwa-combobox>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Preselected: Story = {
  args: {
    value: 'Banana',
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    placeholder: 'Add fruits',
    value: ['Apple', 'Mango'],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Orange',
  },
};

export const Grouped: Story = {
  render: () => html`
    <taqwa-combobox name="produce" placeholder="Search produce">
      <taqwa-combobox-group label="Fruits">${items(['Apple', 'Banana', 'Orange'])}</taqwa-combobox-group>
      <taqwa-combobox-group label="Vegetables">${items(['Carrot', 'Lettuce', 'Spinach'])}</taqwa-combobox-group>
    </taqwa-combobox>
  `,
};

export const AsyncItems: Story = {
  render: () => html`
    <taqwa-combobox name="user" placeholder="Search users" .filter=${null} @input=${searchUsers}>
      ${items(users)}
    </taqwa-combobox>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form style="display: grid; gap: 1rem; width: 16rem" @submit=${onSubmit}>
      <taqwa-combobox name="fruit" placeholder="e.g. Apple" required>${items(fruits)}</taqwa-combobox>
      <taqwa-combobox name="tags" placeholder="Add tags" multiple>${items(fruits.slice(0, 6))}</taqwa-combobox>
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
      style="display: grid; place-items: center; min-height: 28rem; padding: 3rem; background: radial-gradient(circle at 20% 20%, #ff8a5b, transparent 45%), radial-gradient(circle at 80% 30%, #5b8cff, transparent 50%), linear-gradient(135deg, #2a7221, #f5c542);"
    >
      <taqwa-combobox name="fruit" placeholder="e.g. Apple">${items(fruits)}</taqwa-combobox>
    </div>
  `,
};
