#!/usr/bin/env sh
# One-click launcher for macOS/Linux: installs dependencies on first run,
# starts the dev server, and opens the app in your browser.

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed — install the LTS from https://nodejs.org and re-run."
  exit 1
fi

[ -d node_modules ] || npm install

(sleep 2 && (open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null)) &
npm run dev
