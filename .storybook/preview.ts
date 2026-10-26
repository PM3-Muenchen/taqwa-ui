export default {
  parameters: {
    controls: { expanded: true },
    // The Meadow backdrop (mesh + grain) is painted by preview-head.html so the glass has something to blur.
    backgrounds: { disable: true },
  },
};
