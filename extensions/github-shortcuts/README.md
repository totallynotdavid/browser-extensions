# <img src="public/icon.png" width="25"> GitHub Shortcuts

Shows the keyboard shortcut next to each menu item on github.com that has one,
so you stop looking them up.

<p align="center">
  <img src="https://i.imgur.com/7XAFr5y.png" height="115" alt="GitHub navigation menu with shortcut badges">
</p>

The extension reads each element's `data-hotkey` attribute and draws it as a
badge ([`entrypoints/content.ts`](entrypoints/content.ts)). It runs only on
`https://github.com/*` and asks for the `storage` permission only.

The toolbar popup has one checkbox, "Show shortcuts in menus". The choice is
stored in the browser and applies to open GitHub tabs at once
([`src/settings.ts`](src/settings.ts)).

Build and load it as described in the [repository README](../../README.md).
