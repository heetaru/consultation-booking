#!/bin/sh
set -eu

# This container is separate from the development database and is removed on exit.
container=$(docker run -d --rm \
  -e POSTGRES_DB=consultation_test \
  -e POSTGRES_USER=booking \
  -e POSTGRES_PASSWORD=booking \
  -p 127.0.0.1::5432 postgres:18.6)
trap 'docker stop "$container" >/dev/null 2>&1 || true' EXIT INT TERM

attempt=0
until docker exec "$container" pg_isready -U booking -d consultation_test >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 40 ]; then
    echo "PostgreSQL did not start in time." >&2
    exit 1
  fi
  sleep 1
done
port=$(docker port "$container" 5432/tcp | head -n 1 | awk -F: '{print $NF}')
cd "$(dirname "$0")/../backend"
SPRING_DATASOURCE_URL="jdbc:postgresql://127.0.0.1:$port/consultation_test" \
SPRING_DATASOURCE_USERNAME=booking \
SPRING_DATASOURCE_PASSWORD=booking \
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver \
  ./gradlew test --rerun-tasks --no-daemon
