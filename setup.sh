#!/bin/bash

echo "🚀 Amaya Cafe POS - Setup Script"
echo "================================"
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Please run this script with sudo:"
    echo "   sudo bash setup.sh"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Docker
echo "1️⃣ Checking Docker..."
if command_exists docker; then
    echo "✅ Docker is installed"
else
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# 2. Install Docker Compose if needed
echo ""
echo "2️⃣ Checking Docker Compose..."
if command_exists docker-compose; then
    echo "✅ Docker Compose is already installed"
elif docker compose version >/dev/null 2>&1; then
    echo "✅ Docker Compose plugin is installed"
else
    echo "📦 Installing Docker Compose..."
    apt update
    apt install -y docker-compose-v2 || apt install -y docker-compose
    echo "✅ Docker Compose installed"
fi

# 3. Start Docker containers
echo ""
echo "3️⃣ Starting Docker containers..."
if docker compose version >/dev/null 2>&1; then
    docker compose up -d
else
    docker-compose up -d
fi

# 4. Wait for PostgreSQL to be ready
echo ""
echo "4️⃣ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec amaya_pos_db pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

# 5. Run database setup
echo ""
echo "5️⃣ Setting up database..."
echo "   Generating Prisma client..."
npx prisma generate

echo "   Pushing database schema..."
npx prisma db push --skip-seed

echo "   Seeding database with demo data..."
npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Demo credentials:"
echo "   Email: admin@amayacafe.com"
echo "   PIN: 123456"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:3000/login"