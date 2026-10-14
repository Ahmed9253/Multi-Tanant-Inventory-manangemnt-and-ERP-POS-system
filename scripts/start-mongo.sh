#!/usr/bin/env bash
#
# Starts a local MongoDB server for development.
#
# Safe to run repeatedly: it exits immediately if something is already
# listening on the port. Data is stored outside the repo so it is never
# committed. Override the defaults with MONGO_PORT / WORKNEST_MONGO_DATA /
# WORKNEST_MONGO_LOG.
set -euo pipefail

PORT="${MONGO_PORT:-27017}"
DATA_DIR="${WORKNEST_MONGO_DATA:-$HOME/.local/mongodb/data}"
LOG_FILE="${WORKNEST_MONGO_LOG:-$HOME/.local/mongodb/mongod.log}"

if command -v mongod >/dev/null 2>&1; then
  MONGOD="$(command -v mongod)"
elif [ -x "$HOME/.local/mongodb/bin/mongod" ]; then
  MONGOD="$HOME/.local/mongodb/bin/mongod"
else
  echo "mongod was not found." >&2
  echo "Install MongoDB Community Server, or point MONGODB_URI at MongoDB Atlas." >&2
  echo "See the 'Local MongoDB' section in README.md." >&2
  exit 1
fi

if ss -ltn 2>/dev/null | grep -q ":${PORT} "; then
  echo "MongoDB is already listening on port ${PORT}."
  exit 0
fi

mkdir -p "$DATA_DIR" "$(dirname "$LOG_FILE")"

echo "Starting mongod on 127.0.0.1:${PORT}"
echo "  data dir : $DATA_DIR"
echo "  log file : $LOG_FILE"

"$MONGOD" --dbpath "$DATA_DIR" --port "$PORT" --bind_ip 127.0.0.1 \
  --fork --logpath "$LOG_FILE"

echo "MongoDB is running. Start the app with: npm run dev:full"
