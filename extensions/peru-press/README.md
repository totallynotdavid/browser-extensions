# Peru Press

Removes the client-side paywall on gestion.pe, elcomercio.pe and
diariocorreo.pe.

Those sites send the article HTML and mount the wall in the browser. The
extension blocks the Piano and Arc scripts that mount it
([`src/rules.ts`](src/rules.ts)). It runs only on the three news domains and has
no toolbar button, popup or options page.

Build and load it as described in the [repository README](../../README.md).
