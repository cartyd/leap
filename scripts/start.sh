#!/bin/bash
set -e

# Create data directory if it doesn't exist
mkdir -p /data/uploads

# Run Prisma migrations
npx prisma migrate deploy

# Start the application
node -r ./dist/tsconfig-paths-bootstrap.js dist/server.js
