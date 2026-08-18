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

# Publish only the static site assets, not the whole repository. Each
# entry is guarded so a not-yet-generated surface (blog/, tags/, home/ --
# or fonts/ once it's retired) is skipped rather than a hard failure under
# set -euo pipefail.
for asset in index.html style.css fonts research workflows home blog tags; do
  if [[ -e "$ROOT_DIR/$asset" ]]; then
    cp -R "$ROOT_DIR/$asset" "$STAGE_DIR/"
  else
    echo "skipping $asset (not present in $ROOT_DIR)" >&2
  fi
done

rsync -a --delete "$STAGE_DIR"/ "$DOCROOT"/
