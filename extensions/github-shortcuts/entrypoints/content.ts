import { defineContentScript } from "wxt/utils/define-content-script";

import { showShortcuts } from "../src/settings";

export const STYLE_ID = "github-shortcuts-badges";

// GitHub puts the shortcut of a menu item in its data-hotkey attribute. The
// selected item already shows its own hint.
const BADGE_CSS = `
[data-hotkey]:not(.selected)::after {
  content: attr(data-hotkey);
  background: hsla(210deg 29% 70% / 0.2);
  margin: 0 4px;
  padding: 2px 6px;
  display: inline-block;
  line-height: 1em;
  border-radius: 0.5rem;
  font-family: monospace;
  transition: background 0.2s ease-in-out;
}
`;

function render(visible: boolean) {
  const existing = document.getElementById(STYLE_ID);
  if (!visible) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = BADGE_CSS;
  document.head.appendChild(style);
}

export default defineContentScript({
  matches: ["https://github.com/*"],
  async main(ctx) {
    render(await showShortcuts.getValue());
    ctx.onInvalidated(showShortcuts.watch(render));
  },
});
