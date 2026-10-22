# browser-extensions

Small browser extensions for Chromium and Firefox. Each one is its own
[WXT](https://wxt.dev) project under `extensions/`, in one Bun workspace.

## Extensions

| Extension                                       | What it does                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| [github-shortcuts](extensions/github-shortcuts) | Shows the keyboard shortcut next to each item in GitHub's menus. |

## Build and load unpacked

Install [mise](https://mise.jdx.dev), then:

```sh
mise install
bun install --frozen-lockfile
bun run build
```

The build covers Chromium and Firefox. Each build lands in
`extensions/<name>/.output/`.

- **Chromium:** open `chrome://extensions`, turn on Developer mode, choose Load
  unpacked, and select `extensions/<name>/.output/chrome-mv3`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, choose Load
  Temporary Add-on, and select
  `extensions/<name>/.output/firefox-mv3/manifest.json`.

To develop one extension with reload on edit, run
`bun run --cwd extensions/<name> dev` (or `dev:firefox`).

Other scripts: `bun run test`, `bun run lint`, `bun run typecheck`,
`bun run fix` (safe fixes and formatting), and `bun run check`, which runs every
check and the build without writing source files.

## Add an extension

1. Copy `package.json`, `wxt.config.ts`, `tsconfig.json` and `vitest.config.ts`
   from an existing extension into `extensions/<name>/`.
2. Set `name` and `version` in its `package.json` and the manifest fields in its
   `wxt.config.ts`.
3. Add its code under `entrypoints/` and its tests under `tests/`.
4. Run `bun install --frozen-lockfile`. The root scripts and CI pick the new
   folder up.

## Release

CI runs `bun run check` on each push and pull request. Push a tag named
`<extension>-v<version>`, for example `github-shortcuts-v0.2.0`, to zip that
extension for Chromium and Firefox and attach the zips to a GitHub release.

Each extension keeps its notes in `extensions/<name>/release-notes.md`. The
first line must be `<name> <version> is out.`. The release body is that file
followed by GitHub's generated change list. The release run fails when the tag
version is not the `package.json` version or the built `manifest.json` version,
or when the first line is wrong.

The release workflow also runs on pull requests and manual dispatch. Without a
tag it checks every extension against its own `package.json` version, builds and
zips them, and keeps the zips as a workflow artifact. It creates no release. To
zip locally, run `bun run zip`, or `EXTENSION=<name> bun run zip` for one
extension.
