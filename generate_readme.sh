#!/usr/bin/env bash

set -euo pipefail

TIMESTAMP="$(date -u +"%Y-%m-%d %H:%M:%S UTC")"

cat > README.md <<EOF
# VNC Pickems

A simple website for predicting cubing competitions' results, originally designed for Vietnam Championship 2026.

## Getting started

Docker is required.

1. Install Docker and start the daemon (the code below works for CachyOS).
    \`\`\`
    sudo pacman -S docker
    sudo systemctl enable --now docker
    \`\`\`

1. Run backend using Docker. This should start both backend server and MySQL instance.
    \`\`\`
    cd backend
    docker compose up
    \`\`\`

1. Run frontend.
    \`\`\`
    cd frontend
    npm run dev
    \`\`\`

---

Last change: ${TIMESTAMP}
EOF