#!/bin/bash
set -e

echo "Starting application..."

# Check if /data is writable (persistent storage mounted)
if [ ! -w /data ]; then
  echo "WARNING: /data is not writable. Using /tmp for database."
  export DATABASE_URL="file:/tmp/prod.db"
  export UPLOADS_DIR="/tmp/uploads"
  mkdir -p /tmp/uploads
else
  echo "Using persistent storage at /data"
  mkdir -p /data/uploads
fi

echo "Database URL: $DATABASE_URL"
echo "Uploads directory: $UPLOADS_DIR"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "Migration failed, trying to push schema..."
  npx prisma db push --skip-generate || {
    echo "WARNING: Could not apply migrations. Database may need manual setup."
  }
}

echo "Starting server..."
# Start the application
node -r ./dist/tsconfig-paths-bootstrap.js dist/server.js
