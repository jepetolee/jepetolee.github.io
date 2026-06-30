#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4000}"
CONTAINER_NAME="jekyll-dev-${PORT}"

usage() {
  cat <<EOF
Usage: ./serve.sh [start|stop|restart|status]

  start    Start Jekyll dev server (default)
  stop     Stop the running Jekyll container
  restart  Stop then start
  status   Show whether the server is running

Environment:
  PORT=4000   Change the port (default: 4000)
EOF
}

print_access_help() {
  echo ""
  echo "Server is running on port ${PORT}."
  echo ""
  echo "If you use Cursor/VS Code over SSH:"
  echo "  1. Open the Ports panel (bottom panel -> Ports)"
  echo "  2. Forward port ${PORT} if it is not listed automatically"
  echo "  3. Open http://127.0.0.1:${PORT} in your LOCAL browser"
  echo ""
  echo "Stop the server: ./serve.sh stop"
}

find_jekyll_container() {
  docker ps -q --filter "name=^/${CONTAINER_NAME}$" 2>/dev/null || true
}

find_port_container() {
  docker ps -q --filter "publish=${PORT}" 2>/dev/null || true
}

cmd_stop() {
  local id
  id="$(find_jekyll_container)"
  if [[ -n "$id" ]]; then
    docker stop "$id" >/dev/null
    echo "Stopped Jekyll container on port ${PORT}."
    return 0
  fi

  id="$(find_port_container)"
  if [[ -n "$id" ]]; then
    echo "Port ${PORT} is used by another container: $(docker ps --filter id="$id" --format '{{.Names}}')"
    echo "Stop it manually: docker stop ${id}"
    return 1
  fi

  echo "No Jekyll server running on port ${PORT}."
}

cmd_status() {
  local id
  id="$(find_jekyll_container)"
  if [[ -n "$id" ]]; then
    docker ps --filter "id=$id" --format 'Jekyll running: {{.Names}} ({{.Status}}) -> port {{.Ports}}'
    print_access_help
    return 0
  fi

  id="$(find_port_container)"
  if [[ -n "$id" ]]; then
    docker ps --filter "id=$id" --format 'Port ${PORT} in use by: {{.Names}} ({{.Status}}) - not managed by serve.sh'
    echo "Stop it: docker stop ${id}"
    echo "Or use another port: PORT=4001 ./serve.sh start"
    return 1
  fi

  echo "Jekyll is not running on port ${PORT}."
}

cmd_start() {
  local existing
  existing="$(find_jekyll_container)"
  if [[ -n "$existing" ]]; then
    echo "Jekyll is already running on port ${PORT}."
    print_access_help
    exit 0
  fi

  existing="$(find_port_container)"
  if [[ -n "$existing" ]]; then
    echo "Port ${PORT} is already in use by: $(docker ps --filter id="$existing" --format '{{.Names}}')"
    echo ""
    echo "Options:"
    echo "  docker stop ${existing}          # stop the existing container"
    echo "  PORT=4001 ./serve.sh start       # use a different port"
    exit 1
  fi

  echo "Starting Jekyll on port ${PORT}..."

  docker run --rm \
    --name "$CONTAINER_NAME" \
    -p "${PORT}:${PORT}" \
    -v "$(pwd):/srv/jekyll" \
    jekyll/jekyll:4 \
    sh -c "bundle install && bundle exec jekyll serve --host 0.0.0.0 --port ${PORT}"
}

ACTION="${1:-start}"

case "$ACTION" in
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_stop || true; cmd_start ;;
  status) cmd_status ;;
  -h|--help|help) usage ;;
  *)
    echo "Unknown command: $ACTION"
    usage
    exit 1
    ;;
esac
