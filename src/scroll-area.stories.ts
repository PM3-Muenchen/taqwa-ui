import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './scroll-area';

const paragraphs = [
  'Vernacular architecture is building done outside any academic tradition, and without professional guidance. It is not a particular architectural movement or style, but rather a broad category, encompassing a wide range and variety of building types.',
  'This type of architecture usually serves immediate, local needs, is constrained by the materials available in its particular region and reflects local traditions and cultural practices.',
  'The study of vernacular architecture does not examine formally schooled architects, but instead that of the design skills and tradition of local builders, who were rarely given any attribution for the work.',
  'More recently, vernacular architecture has been examined by designers and the building industry in an effort to be more energy conscious with contemporary design and construction.',
];

const meta = {
  title: 'Components/Scroll Area',
  component: 'taqwa-scroll-area',
  parameters: {
    layout: 'centered',
  },
  render: () => html`
    <taqwa-scroll-area style="height: 10rem; width: 24rem; max-width: calc(100vw - 2rem)">
      <div style="display: grid; gap: 1rem; padding: 0.5rem 1.25rem 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.375rem">
        ${paragraphs.map((text) => html`<p style="margin: 0">${text}</p>`)}
      </div>
    </taqwa-scroll-area>
  `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Vertical: Story = {};

export const Horizontal: Story = {
  render: () => html`
    <taqwa-scroll-area style="height: 6rem; width: 24rem; max-width: calc(100vw - 2rem)">
      <div style="display: flex; gap: 0.75rem; padding: 0.75rem; width: max-content">
        ${Array.from({ length: 12 }, (_, i) => html`<div style="flex: none; width: 7rem; height: 3.5rem; display: grid; place-items: center; border-radius: 0.375rem; background: color-mix(in oklab, #2a7221 ${20 + i * 6}%, #fafff2); font-weight: 700">${i + 1}</div>`)}
      </div>
    </taqwa-scroll-area>
  `,
};

export const Both: Story = {
  render: () => html`
    <taqwa-scroll-area style="height: 20rem; width: 20rem; max-width: calc(100vw - 2rem)">
      <div style="display: grid; grid-template-columns: repeat(10, 6.25rem); grid-auto-rows: 6.25rem; gap: 0.75rem; padding: 0.75rem 1.5rem 1.5rem 0.75rem; width: max-content">
        ${Array.from({ length: 100 }, (_, i) => html`<div style="display: grid; place-items: center; background: color-mix(in oklab, #cfee9e 60%, #fafff2); font-size: 0.875rem; font-weight: 700">${i + 1}</div>`)}
      </div>
    </taqwa-scroll-area>
  `,
};

export const OnGradient: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => html`
    <div style="min-height: 100vh; display: grid; place-items: center; padding: 2rem">
      <taqwa-scroll-area style="height: 10rem; width: 22rem; max-width: 100%; border-radius: 0.375rem; background: rgb(255 255 255 / 0.2)">
        <div style="display: grid; gap: 0.75rem; padding: 0.75rem; font-size: 0.875rem">
          ${paragraphs.map((text) => html`<p style="margin: 0">${text}</p>`)}
        </div>
      </taqwa-scroll-area>
    </div>
  `,
};
