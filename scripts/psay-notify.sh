#!/bin/zsh
# SPDX-License-Identifier: MIT

set -euo pipefail

threshold=10
title="psay"
sound="default"
speak=1

usage() {
  cat <<'EOF'
Usage:
  scripts/psay-notify.sh [options] -- <command> [args...]

Options:
  --threshold <seconds>  Minimum runtime before notifying (default: 10)
  --title <text>         Notification title (default: psay)
  --sound <name>         Notification sound for terminal-notifier (default: default)
  --no-speak             Disable spoken completion message
  -h, --help             Show help

Examples:
  scripts/psay-notify.sh -- make test
  scripts/psay-notify.sh --threshold 30 --title "Agent Run" -- pnpm build
EOF
}

escape_for_osascript() {
  local text="$1"
  text="${text//\\/\\\\}"
  text="${text//\"/\\\"}"
  text="${text//$'\n'/ }"
  printf '%s' "$text"
}

notify_local() {
  local notify_title="$1"
  local notify_message="$2"

  if command -v terminal-notifier >/dev/null 2>&1; then
    terminal-notifier \
      -title "$notify_title" \
      -message "$notify_message" \
      -sound "$sound" >/dev/null 2>&1 || true
    return 0
  fi

  local escaped_title escaped_message
  escaped_title="$(escape_for_osascript "$notify_title")"
  escaped_message="$(escape_for_osascript "$notify_message")"
  osascript -e "display notification \"$escaped_message\" with title \"$escaped_title\"" >/dev/null 2>&1 || true
}

speak_local() {
  local text="$1"
  local piper_python="${HOME}/tts/piper/.venv/bin/python"
  local piper_model="${PSAY_MODEL:-${HOME}/tts/piper/voices/en_US-lessac-medium.onnx}"
  local out="/tmp/piper-notify.wav"

  if [[ -x "$piper_python" && -f "$piper_model" ]]; then
    "$piper_python" -m piper -m "$piper_model" -f "$out" -- "$text" >/dev/null 2>&1 || return 0
    afplay "$out" >/dev/null 2>&1 || true
    rm -f "$out"
    return 0
  fi

  if command -v say >/dev/null 2>&1; then
    say "$text" >/dev/null 2>&1 || true
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --threshold)
      [[ $# -ge 2 ]] || { echo "--threshold requires a value" >&2; exit 2; }
      threshold="$2"
      shift 2
      ;;
    --title)
      [[ $# -ge 2 ]] || { echo "--title requires a value" >&2; exit 2; }
      title="$2"
      shift 2
      ;;
    --sound)
      [[ $# -ge 2 ]] || { echo "--sound requires a value" >&2; exit 2; }
      sound="$2"
      shift 2
      ;;
    --no-speak)
      speak=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ $# -eq 0 ]]; then
  echo "No command provided." >&2
  usage >&2
  exit 2
fi

if [[ ! "$threshold" =~ ^[0-9]+$ ]]; then
  echo "--threshold must be a non-negative integer" >&2
  exit 2
fi

command_text="$*"
start_time=$SECONDS

set +e
"$@"
exit_code=$?
set -e

elapsed=$((SECONDS - start_time))

if (( elapsed >= threshold )); then
  summary="exit ${exit_code} in ${elapsed}s: ${command_text}"
  notify_local "$title" "$summary"
  if (( speak == 1 )); then
    speak_local "Command finished, ${summary}"
  fi
fi

exit "$exit_code"
