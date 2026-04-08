#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCROOT="${1:-$HOME/Library/Application Support/i2p/eepsite/docroot}"
STAGE_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$STAGE_DIR"
}

trap cleanup EXIT

if [[ ! -d "$DOCROOT" ]]; then
  echo "eepsite docroot not found: $DOCROOT" >&2
  exit 1
fi

# Publish only the static site assets, not the whole repository.
cp "$ROOT_DIR/index.html" "$STAGE_DIR/"
cp "$ROOT_DIR/style.css" "$STAGE_DIR/"
cp -R "$ROOT_DIR/fonts" "$STAGE_DIR/fonts"
cp -R "$ROOT_DIR/research" "$STAGE_DIR/research"
cp -R "$ROOT_DIR/workflows" "$STAGE_DIR/workflows"

rsync -a --delete "$STAGE_DIR"/ "$DOCROOT"/
