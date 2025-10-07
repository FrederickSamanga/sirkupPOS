#!/bin/bash

echo "🚀 Amaya Cafe POS - Quick Start"
echo "=============================="
echo ""

# Check if PostgreSQL is running
if sudo docker ps | grep -q amaya_postgres; then
    echo "✅ PostgreSQL is already running"
else
    echo "Starting PostgreSQL..."
    sudo docker run -d \
      --name amaya_postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=amaya_pos \
      -p 5432:5432 \
      postgres:15-alpine 2>/dev/null || sudo docker start amaya_postgres

    echo "Waiting for database..."
    sleep 5
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push --skip-seed
npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Login credentials:"
echo "   Email: admin@amayacafe.com"
echo "   PIN: 123456"
echo ""
echo "🚀 Starting the app..."
echo ""
npm run dev