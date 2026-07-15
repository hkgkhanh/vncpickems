# VNC Pickems
A simple website for predicting cubing competitions' results, originally designed for Vietnam Championship 2026.


## Getting started

Docker is required.

<!-- 1. Install Docker and start the daemon (the code below works with CachyOS).
    ```
    sudo pacman -S docker
    sudo systemctl enable --now docker
    ``` -->

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


https://www.worldcubeassociation.org/api/v0/competitions/VietnamChampionship2026 -> lấy trường event_ids.

Sau đó duyệt qua các id trong mảng event_ids, để lấy psych sheet theo từng event_id.
https://www.worldcubeassociation.org/api/v0/competitions/VietnamChampionship2026/psych-sheet/skewb

API này là ko cần thiết.
https://www.worldcubeassociation.org/api/v1/competitions/VietnamChampionship2026/registrations