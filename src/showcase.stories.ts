import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { Bold, Italic, Underline } from 'lucide';
import { icon } from './internal/icons';
import './index';
import { toast, type TaqwaDialog } from './index';

// Story-only card that mirrors the `glass-surface` recipe (theme tokens live inside shadow roots).
const styles = html`<style>
  .showcase {
    box-sizing: border-box;
    min-height: 100vh;
    padding: 3rem clamp(1rem, 4vw, 3.5rem);
    display: grid;
    gap: 1.5rem;
    max-width: 76rem;
    margin-inline: auto;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .showcase-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    align-items: start;
  }
  .showcase-card {
    display: grid;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 0.875rem;
    color: #152614;
    background-color: rgb(250 255 242 / 0.64);
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.07'/%3E%3C/svg%3E"),
      linear-gradient(to bottom, rgb(255 255 255 / 0.34), rgb(255 255 255 / 0) 4rem);
    -webkit-backdrop-filter: blur(22px) saturate(160%);
    backdrop-filter: blur(22px) saturate(160%);
    box-shadow:
      inset 0 1px 0 0 rgb(255 255 255 / 0.8),
      inset 0 0 0 1px rgb(255 255 255 / 0.32),
      0 0 0 1px rgb(21 38 20 / 0.11),
      0 24px 56px -16px rgb(33 96 42 / 0.3),
      0 6px 16px -6px rgb(21 38 20 / 0.12);
  }
  .showcase-hero {
    padding: 2.5rem;
    gap: 0.75rem;
  }
  .showcase-eyebrow {
    margin: 0;
    font: 500 0.8125rem/1.25rem 'Inter', sans-serif;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4d5c4a;
  }
  .showcase-display {
    margin: 0;
    font: 400 3.5rem/1.05 'Instrument Serif', serif;
    letter-spacing: -0.01em;
  }
  .showcase-display em {
    color: #21602a;
  }
  .showcase h2 {
    margin: 0;
    font: 600 1.25rem/1.3 'Stack Sans Headline', 'Inter', sans-serif;
    letter-spacing: -0.01em;
  }
  .showcase-lede {
    margin: 0;
    max-width: 38rem;
    color: #4d5c4a;
    font-size: 0.9375rem;
    line-height: 1.5rem;
  }
  .showcase-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  .showcase-actions {
    margin-top: 0.75rem;
  }
  .showcase-stack {
    display: grid;
    gap: 1rem;
  }
  .showcase-section-label {
    margin: 0;
    font-weight: 500;
    color: #4d5c4a;
  }
</style>`;

const formCard = html`
  <section class="showcase-card" aria-labelledby="showcase-form">
    <h2 id="showcase-form">Create a workspace</h2>
    <taqwa-field label="Workspace name" description="Visible to everyone you invite.">
      <taqwa-input placeholder="Meadow Studio"></taqwa-input>
    </taqwa-field>
    <taqwa-field label="Region">
      <taqwa-select placeholder="Pick a region" style="width: 100%">
        <taqwa-select-item value="eu">Europe (Frankfurt)</taqwa-select-item>
        <taqwa-select-item value="us">United States (Virginia)</taqwa-select-item>
        <taqwa-select-item value="ap">Asia Pacific (Singapore)</taqwa-select-item>
      </taqwa-select>
    </taqwa-field>
    <div class="showcase-stack">
      <p class="showcase-section-label">Plan</p>
      <taqwa-radio-group aria-label="Plan" value="pro">
        <taqwa-radio value="free">Free</taqwa-radio>
        <taqwa-radio value="pro">Pro</taqwa-radio>
        <taqwa-radio value="team">Team</taqwa-radio>
      </taqwa-radio-group>
    </div>
    <div class="showcase-stack">
      <taqwa-checkbox checked>Send me a weekly summary</taqwa-checkbox>
      <taqwa-switch checked>Allow guests</taqwa-switch>
    </div>
    <div class="showcase-stack">
      <p class="showcase-section-label">Storage limit</p>
      <taqwa-slider aria-label="Storage limit" .value=${60} style="width: 100%"></taqwa-slider>
    </div>
    <div class="showcase-row">
      <taqwa-button>Create workspace</taqwa-button>
      <taqwa-button variant="tertiary">Cancel</taqwa-button>
    </div>
  </section>
`;

const controlsCard = html`
  <section class="showcase-card" aria-labelledby="showcase-controls">
    <h2 id="showcase-controls">Controls</h2>
    <div class="showcase-row">
      <taqwa-button>Primary</taqwa-button>
      <taqwa-button variant="secondary">Secondary</taqwa-button>
      <taqwa-button variant="tertiary">Tertiary</taqwa-button>
      <taqwa-button variant="destructive">Delete</taqwa-button>
      <taqwa-button disabled>Disabled</taqwa-button>
    </div>
    <taqwa-tabs value="overview">
      <taqwa-tabs-list>
        <taqwa-tab value="overview">Overview</taqwa-tab>
        <taqwa-tab value="projects">Projects</taqwa-tab>
        <taqwa-tab value="account">Account</taqwa-tab>
      </taqwa-tabs-list>
      <taqwa-tabs-panel value="overview"><p style="margin: 0">Workspace stats and activity.</p></taqwa-tabs-panel>
      <taqwa-tabs-panel value="projects"><p style="margin: 0">Milestones and deadlines.</p></taqwa-tabs-panel>
      <taqwa-tabs-panel value="account"><p style="margin: 0">Profile and preferences.</p></taqwa-tabs-panel>
    </taqwa-tabs>
    <div class="showcase-row">
      <taqwa-toggle-group aria-label="Text formatting" multiple .value=${['bold']}>
        <taqwa-toggle value="bold" aria-label="Bold">${icon(Bold)}</taqwa-toggle>
        <taqwa-toggle value="italic" aria-label="Italic">${icon(Italic)}</taqwa-toggle>
        <taqwa-toggle value="underline" aria-label="Underline">${icon(Underline)}</taqwa-toggle>
      </taqwa-toggle-group>
      <taqwa-toggle-group aria-label="Billing period" .value=${['monthly']}>
        <taqwa-toggle value="monthly">Monthly</taqwa-toggle>
        <taqwa-toggle value="yearly">Yearly</taqwa-toggle>
      </taqwa-toggle-group>
    </div>
    <taqwa-progress .value=${64}><span slot="label">Uploading</span></taqwa-progress>
    <taqwa-meter .value=${42}><span slot="label">Storage used</span></taqwa-meter>
    <div class="showcase-row">
      <taqwa-avatar>AL</taqwa-avatar>
      <taqwa-avatar>SA</taqwa-avatar>
      <taqwa-avatar>MK</taqwa-avatar>
    </div>
  </section>
`;

const openDialog = () => document.querySelector<TaqwaDialog>('#showcase-dialog')!.show();

// Popups sit in the top layer, but a non-modal dialog does not, so it stays outside the (backdrop-filtered) cards.
const page = (open = false) => html`
  ${styles}
  <taqwa-toast-region></taqwa-toast-region>
  <main class="showcase">
    <header class="showcase-card showcase-hero">
      <p class="showcase-eyebrow">Taqwa UI · Frosted Meadow</p>
      <h1 class="showcase-display">Calm tools for <em>focused</em> work.</h1>
      <p class="showcase-lede">
        Frosted ivory glass on a solid Ivory page. Deep green for the one action that matters, lime cream for
        everything you select.
      </p>
      <div class="showcase-row showcase-actions">
        <taqwa-menu ?open=${open}>
          <taqwa-button slot="trigger" variant="secondary">Menu</taqwa-button>
          <taqwa-menu-item value="rename">Rename</taqwa-menu-item>
          <taqwa-menu-item value="duplicate">Duplicate</taqwa-menu-item>
          <taqwa-menu-item value="share">Share…</taqwa-menu-item>
          <taqwa-menu-separator></taqwa-menu-separator>
          <taqwa-menu-item value="archive">Archive</taqwa-menu-item>
          <taqwa-menu-item value="delete" disabled>Delete</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-button variant="secondary" @click=${openDialog}>Open dialog</taqwa-button>
        <taqwa-button
          variant="tertiary"
          @click=${() => toast.add({ type: 'success', title: 'Changes saved', description: 'Your workspace was updated.' })}
          >Show toast</taqwa-button
        >
        <span style="flex: 1"></span>
        <taqwa-popover ?open=${open} align="end" arrow>
          <taqwa-button slot="trigger" variant="tertiary">Notifications</taqwa-button>
          <span slot="title">Notifications</span>
          <span slot="description">You are all caught up. New activity from your workspace shows up here.</span>
          <taqwa-button slot="close" variant="secondary">Close</taqwa-button>
        </taqwa-popover>
      </div>
    </header>
    <div class="showcase-grid">${formCard} ${controlsCard}</div>
  </main>
  <taqwa-dialog id="showcase-dialog" ?open=${open} .modal=${!open}>
    <span slot="title">Rename project</span>
    <span slot="description">Projects appear in the sidebar and can be renamed at any time.</span>
    <taqwa-field label="Project name">
      <taqwa-input value="Spring launch"></taqwa-input>
    </taqwa-field>
    <taqwa-button slot="close" variant="secondary">Cancel</taqwa-button>
    <taqwa-button slot="close">Save</taqwa-button>
  </taqwa-dialog>
`;

const meta = {
  title: 'Design/Showcase',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => page(),
};

/** The dialog (non-modal, so the page stays visible), menu and popover start open for screenshots. */
export const OpenSurfaces: Story = {
  render: () => page(true),
};
