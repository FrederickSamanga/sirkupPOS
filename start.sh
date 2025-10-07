#!/bin/bash

echo "🚀 Starting Amaya Cafe POS"
echo "========================="
echo ""

# Start PostgreSQL only (minimal setup)
echo "Starting PostgreSQL database..."
sudo docker run -d \
  --name amaya_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=amaya_pos \
  -p 5432:5432 \
  postgres:15-alpine 2>/dev/null || echo "PostgreSQL container already exists"

# Check if it's running
if sudo docker ps | grep -q amaya_postgres; then
    echo "✅ PostgreSQL is running"
else
    echo "Starting existing PostgreSQL container..."
    sudo docker start amaya_postgres
fi

# Wait for PostgreSQL to be ready
echo "Waiting for database to be ready..."
sleep 5

# Setup database
echo "Setting up database..."
npx prisma generate
npx prisma db push --skip-seed
npx prisma db seed

echo ""
echo "✅ Everything is ready!"
echo ""
echo "📝 Demo Login:"
echo "   Email: admin@amayacafe.com"
echo "   PIN: 123456"
echo ""
echo "🚀 Starting development server..."
npm run dev