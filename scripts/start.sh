#!/bin/bash
set -e

# Create data directory if it doesn't exist
mkdir -p /data/uploads

# Run Prisma migrations
npx prisma migrate deploy

# Start the application
node dist/server.js
