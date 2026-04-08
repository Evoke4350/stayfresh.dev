#!/bin/zsh

set -euo pipefail

I2P_DIR="/opt/homebrew/Cellar/i2p/2.11.0/libexec"
CONFIG_DIR="${HOME}/Library/Application Support/i2p"
JAVA_BIN="$(command -v java)"
CLASSPATH="$(printf '%s:' "$I2P_DIR"/lib/*.jar)"

if [[ ! -x "$JAVA_BIN" ]]; then
  echo "java not found in PATH" >&2
  exit 1
fi

if [[ ! -d "$I2P_DIR" ]]; then
  echo "i2p install not found: $I2P_DIR" >&2
  exit 1
fi

if [[ ! -d "$CONFIG_DIR" ]]; then
  echo "i2p config dir not found: $CONFIG_DIR" >&2
  exit 1
fi

export JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"

exec "$JAVA_BIN" \
  -cp "${CLASSPATH%:}" \
  -Djava.net.preferIPv4Stack=false \
  -Djava.library.path="${I2P_DIR}:${I2P_DIR}/lib" \
  -Di2p.dir.base="${I2P_DIR}" \
  -Di2p.dir.config="${CONFIG_DIR}" \
  -DloggerFilenameOverride="${CONFIG_DIR}/logs/log-router-@.txt" \
  net.i2p.router.RouterLaunch
