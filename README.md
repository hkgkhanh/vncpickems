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
