#!/bin/bash

echo "🚀 Amaya Cafe POS - Local Setup (No Docker)"
echo "==========================================="
echo ""

# For users without Docker, we'll use a local PostgreSQL
echo "This script will set up the app using a local PostgreSQL database."
echo ""

# Check if PostgreSQL is installed
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL is installed"
else
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "To install PostgreSQL on Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "To install on macOS:"
    echo "  brew install postgresql"
    echo "  brew services start postgresql"
    echo ""
    exit 1
fi

# Create database and user
echo "Creating database (you may be prompted for PostgreSQL password)..."
sudo -u postgres psql <<EOF
CREATE DATABASE amaya_pos;
CREATE USER amaya_user WITH PASSWORD 'amaya_password';
GRANT ALL PRIVILEGES ON DATABASE amaya_pos TO amaya_user;
\q
EOF

# Update .env file
echo "Updating .env file..."
cat > .env <<EOF
# Database
DATABASE_URL="postgresql://amaya_user:amaya_password@localhost:5432/amaya_pos?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Application
APP_URL="http://localhost:3000"
NODE_ENV="development"
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup database
echo "Setting up database schema..."
npx prisma generate
npx prisma db push --skip-seed

echo "Seeding database..."
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