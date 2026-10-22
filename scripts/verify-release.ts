// TAG selects one extension by its `<extension>-v<version>` value.
// Without TAG, check every extension against its package.json version.
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";

const phase = process.argv[2];
if (phase !== "source" && phase !== "built") {
  console.error("usage: verify-release.ts source|built");
  process.exit(2);
}

const tag = process.env.TAG ?? "";
const errors: string[] = [];

const readJson = (path: string): { version?: string } =>
  JSON.parse(readFileSync(path, "utf8"));

const targets: { name: string; tagVersion: string | null }[] = [];
if (tag) {
  const match = /^(.+)-v(.+)$/.exec(tag);
  if (!match) {
    console.error(`tag ${tag} is not <extension>-v<version>`);
    process.exit(1);
  }
  targets.push({ name: match[1], tagVersion: match[2] });
} else {
  for (const entry of readdirSync("extensions", { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      existsSync(`extensions/${entry.name}/package.json`)
    ) {
      targets.push({ name: entry.name, tagVersion: null });
    }
  }
}

for (const { name, tagVersion } of targets) {
  const dir = `extensions/${name}`;
  if (!existsSync(`${dir}/package.json`)) {
    errors.push(`no extension named ${name}`);
    continue;
  }
  const version = readJson(`${dir}/package.json`).version;

  if (phase === "source") {
    if (tagVersion !== null && tagVersion !== version) {
      errors.push(
        `${name}: tag version ${tagVersion} differs from package.json version ${version}`,
      );
    }

    const notesPath = `${dir}/release-notes.md`;
    const expected = `${name} ${tagVersion ?? version} is out.`;
    if (!existsSync(notesPath)) {
      errors.push(`${name}: ${notesPath} is missing`);
    } else {
      const first = readFileSync(notesPath, "utf8").split(/\r?\n/)[0];
      if (first !== expected) {
        errors.push(
          `${name}: first line of ${notesPath} is "${first}", expected "${expected}"`,
        );
      }
    }
  } else {
    for (const build of ["chrome-mv3", "firefox-mv3"]) {
      const manifestPath = `${dir}/.output/${build}/manifest.json`;
      if (!existsSync(manifestPath)) {
        errors.push(`${name}: ${manifestPath} is missing`);
        continue;
      }
      const built = readJson(manifestPath).version;
      if (built !== (tagVersion ?? version)) {
        errors.push(
          `${name}: ${manifestPath} version ${built} differs from ${tagVersion ?? version}`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

if (phase === "source" && tag && process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `EXTENSION=${targets[0].name}\n`);
}
console.log(
  `${phase} check passed for ${targets.map((target) => target.name).join(", ")}`,
);
