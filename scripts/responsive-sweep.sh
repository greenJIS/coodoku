#!/usr/bin/env bash
# Screenshot Home, Game, Settings, and Help at every target viewport.
# Usage: BASE=http://localhost:5199 OUT=/tmp/responsive-sweep bash scripts/responsive-sweep.sh
set -euo pipefail

BASE="${BASE:-http://localhost:5199}"
OUT="${OUT:-/tmp/responsive-sweep}"
VIEWPORTS="320x568 360x640 375x667 390x844 430x932 768x1024 1024x768 800x600 667x375 844x390 932x430"
mkdir -p "$OUT"

for vp in $VIEWPORTS; do
  w="${vp%x*}"
  h="${vp#*x}"
  agent-browser set viewport "$w" "$h" >/dev/null
  agent-browser open "$BASE" >/dev/null
  agent-browser screenshot "$OUT/$vp-loading.png" >/dev/null
  sleep 2.5
  agent-browser screenshot "$OUT/$vp-home.png" >/dev/null

  agent-browser find role button click --name "How to play" >/dev/null || true
  sleep 1
  agent-browser screenshot "$OUT/$vp-help.png" >/dev/null

  agent-browser open "$BASE" >/dev/null
  sleep 2.5
  agent-browser find text "Continue" click >/dev/null 2>&1 ||
    agent-browser find role button click --name "Play Easy" >/dev/null
  sleep 3
  agent-browser screenshot "$OUT/$vp-game.png" >/dev/null

  agent-browser find role button click --name "Settings" >/dev/null || true
  sleep 1
  agent-browser screenshot "$OUT/$vp-settings.png" >/dev/null
  echo "$vp done"
done
echo "Screenshots in $OUT"
