import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { ContentScriptContext } from "wxt/utils/content-script-context";

import content from "../entrypoints/content";
import { showShortcuts } from "../src/settings";

function badgeStyles() {
  return [...document.head.querySelectorAll("style")].filter((style) =>
    style.textContent.includes("attr(data-hotkey)"),
  );
}

async function loadContentScript() {
  const ctx = new ContentScriptContext("content", content);
  await content.main(ctx);
  return ctx;
}

// Storage watchers run after the write resolves.
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  fakeBrowser.reset();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

describe("content script", () => {
  it("runs on github.com", () => {
    expect(content.matches).toEqual(["https://github.com/*"]);
  });

  it("injects the shortcut badge style by default", async () => {
    await loadContentScript();

    expect(badgeStyles()).toHaveLength(1);
  });

  it("injects nothing when shortcuts are switched off", async () => {
    await showShortcuts.setValue(false);

    await loadContentScript();

    expect(badgeStyles()).toHaveLength(0);
  });

  it("removes the style when the setting turns off and restores it when it turns on", async () => {
    await loadContentScript();

    await showShortcuts.setValue(false);
    await settled();
    expect(badgeStyles()).toHaveLength(0);

    await showShortcuts.setValue(true);
    await settled();
    expect(badgeStyles()).toHaveLength(1);
  });

  it("keeps one style when the setting is switched on repeatedly", async () => {
    await loadContentScript();

    await showShortcuts.setValue(false);
    await showShortcuts.setValue(true);
    await showShortcuts.setValue(true);
    await settled();

    expect(badgeStyles()).toHaveLength(1);
  });

  it("leaves the page's own styles alone", async () => {
    const pageStyle = document.createElement("style");
    pageStyle.textContent = "body { margin: 0 }";
    document.head.prepend(pageStyle);
    await loadContentScript();

    await showShortcuts.setValue(false);
    await settled();

    expect(document.head.contains(pageStyle)).toBe(true);
  });

  it("stops following the setting once the page's script is invalidated", async () => {
    const ctx = await loadContentScript();
    await showShortcuts.setValue(false);
    await settled();
    ctx.notifyInvalidated();

    await showShortcuts.setValue(true);
    await settled();

    expect(badgeStyles()).toHaveLength(0);
  });

  it("follows the popup checkbox", async () => {
    document.body.innerHTML = '<input type="checkbox" id="show-shortcuts" />';
    await loadContentScript();
    await import("../entrypoints/popup/main");
    const checkbox =
      document.querySelector<HTMLInputElement>("#show-shortcuts");

    expect(checkbox?.checked).toBe(true);
    checkbox?.click();
    await settled();

    expect(badgeStyles()).toHaveLength(0);
  });
});
