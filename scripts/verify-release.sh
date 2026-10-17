#!/usr/bin/env bash
# Validates that TAG names an extension at its package.json version.
# Writes EXTENSION to GITHUB_ENV for later workflow steps.
set -euo pipefail

name="${TAG%-v*}"
version="${TAG##*-v}"

if [ ! -f "extensions/$name/package.json" ]; then
  echo "no extension named $name" >&2
  exit 1
fi

packaged="$(bun -e "console.log(require('./extensions/$name/package.json').version)")"
if [ "$packaged" != "$version" ]; then
  echo "tag version $version differs from package.json version $packaged" >&2
  exit 1
fi

if [ -n "${GITHUB_ENV:-}" ]; then
  echo "EXTENSION=$name" >> "$GITHUB_ENV"
fi
