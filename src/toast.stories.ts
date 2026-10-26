import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './button';
import './toast';
import { toast, type ToastType } from './toast';

const types: ToastType[] = ['default', 'success', 'error', 'warning', 'info', 'loading'];

const meta = {
  title: 'Components/Toast',
  component: 'taqwa-toast-region',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => html`
    <div
      style="min-height: 100vh; display: grid; place-content: center; gap: 0.75rem; padding: 2rem; background: linear-gradient(135deg, #2a7221 0%, #cfee9e 42%, #b42318 100%)"
    >
      <taqwa-toast-region></taqwa-toast-region>
      <taqwa-button variant="primary" @click=${() => toast.add({ title: 'Changes saved', description: 'Your profile was updated.' })}>
        Show toast
      </taqwa-button>
    </div>
  `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

const page = (buttons: TemplateResult) => html`
  <div
    style="min-height: 100vh; display: grid; place-content: center; gap: 0.75rem; padding: 2rem; background: linear-gradient(135deg, #2a7221 0%, #cfee9e 42%, #b42318 100%)"
  >
    <taqwa-toast-region></taqwa-toast-region>
    ${buttons}
  </div>
`;

export const Default: Story = {};

export const Types: Story = {
  render: () =>
    page(html`<div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
      ${types.map(
        (type) =>
          html`<taqwa-button variant="secondary" @click=${() => toast.add({ type, title: `${type} toast`, description: 'A short description of what happened.' })}>
            ${type}
          </taqwa-button>`,
      )}
    </div>`),
};

export const PromiseToast: Story = {
  render: () =>
    page(html`<taqwa-button
      variant="primary"
      @click=${() => {
        const save = new Promise<string>((resolve, reject) =>
          setTimeout(() => (Math.random() > 0.3 ? resolve('Saved') : reject(new Error('Network unavailable'))), 1500),
        );
        toast.promise(save, {
          loading: 'Saving changes…',
          success: (value) => ({ title: value, description: 'Your changes are live.' }),
          error: (error) => ({ title: 'Could not save', description: (error as Error).message }),
        });
      }}
    >
      Save with promise
    </taqwa-button>`),
};

export const Actions: Story = {
  render: () =>
    page(html`<taqwa-button
      variant="primary"
      @click=${() => {
        const id = toast.add({
          type: 'success',
          title: 'Item archived',
          description: 'You can undo this within 10 seconds.',
          timeout: 10000,
          actions: [
            {
              label: 'Undo',
              onClick: () => {
                toast.close(id);
                toast.add({ title: 'Archive undone', type: 'info' });
              },
            },
          ],
        });
      }}
    >
      Archive item
    </taqwa-button>`),
};

export const Stacking: Story = {
  render: () =>
    page(html`<taqwa-button
      variant="primary"
      @click=${() => {
        for (let i = 1; i <= 5; i++) toast.add({ title: `Notification ${i}`, description: 'Hover the stack to expand it.' });
      }}
    >
      Add five toasts
    </taqwa-button>`),
};

export const Sticky: Story = {
  render: () =>
    page(html`<taqwa-button
      variant="destructive"
      @click=${() => toast.add({ type: 'error', title: 'Upload failed', description: 'This toast stays until you dismiss it.', timeout: 0, priority: 'high' })}
    >
      Show sticky error
    </taqwa-button>`),
};
