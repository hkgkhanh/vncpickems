# VNC Pickems

A simple website for predicting cubing competitions' results, originally designed for Vietnam Championship 2026.

## Getting started

Docker is required.

1. Install Docker and start the daemon (the code below works for CachyOS).
    ```
    sudo pacman -S docker
    sudo systemctl enable --now docker
    ```

1. Run backend using Docker. This should start both backend server and MySQL instance.
    ```
    cd backend
    docker compose up
    ```

1. Run frontend.
    ```
    cd frontend
    npm run dev
    ```

---

Last change: 2026-08-06 02:52:27 UTC

Last updated: Tue Aug 11 01:24:13 UTC 2026

Last updated: Sun Aug 16 01:06:22 UTC 2026

Last updated: Fri Aug 21 01:06:29 UTC 2026

Last updated: Wed Aug 26 01:06:32 UTC 2026

Last updated: Mon Aug 31 03:29:05 UTC 2026

Last updated: Tue Sep  1 03:28:10 UTC 2026

Last updated: Tue Sep  1 03:46:46 UTC 2026
