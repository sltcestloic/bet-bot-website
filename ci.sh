#!/usr/bin/env bash

while true; do
    git fetch origin

    LOCAL_HASH=$(git rev-parse HEAD)
    REMOTE_HASH=$(git rev-parse origin/$(git rev-parse --abbrev-ref HEAD))

    if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
        echo "$(date): Changes detected, pulling..."

        if ! git pull --ff-only; then
            echo "$(date): git pull failed, skipping."
            sleep 10
            continue
        fi

        echo "$(date): Restarting container..."
        docker compose restart bet-bot-website
    else
        echo "$(date): No changes."
    fi

    sleep 10
done