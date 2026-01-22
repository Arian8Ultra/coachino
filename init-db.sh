#!/bin/sh
set -e

# DATABASE ENV
NEW_DB_URL="postgresql://coachino:coachino@coachino-db:5432/coachino"
OLD_DB_URL="postgresql://arian:X98O51LfrQJr@82.115.25.20:5432/coachino"
IMPORT="${IMPORT:-true}"

# Check if DB is empty
if [ "${IMPORT}" != "true" ] && [ "${IMPORT}" != "1" ]; then
  echo "IMPORT is disabled. Skipping import."
else
  echo "Checking if new database is empty..."
  EMPTY=$(psql "$NEW_DB_URL" -tAc "SELECT 1 FROM user WHERE TRUE LIMIT 1;")

  if [ -z "$EMPTY" ]; then
    echo "New DB is empty. Copying data from old server..."

    # Dump from old DB and restore to new DB
    pg_dump --no-owner --no-privileges "$OLD_DB_URL" | psql "$NEW_DB_URL"

    echo "Data copied successfully!"
  else
    echo "New DB is not empty. Skipping import."
  fi
fi

# Run Prisma migrations (optional but safe)
bunx prisma migrate deploy

# Start the app
bun run start
