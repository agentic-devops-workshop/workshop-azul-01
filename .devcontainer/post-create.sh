#!/bin/bash
set -e

echo "🚀 Setting up SIFAP Modernization Workshop Dev Container..."

# Update system packages
echo "📦 Updating system packages..."
apt-get update -q && apt-get install -y -q \
    curl \
    wget \
    git \
    build-essential \
    postgresql-client \
    > /dev/null 2>&1

# Install Docker Compose if not already present
if ! command -v docker-compose &> /dev/null; then
    echo "📥 Installing Docker Compose..."
    curl -sL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js dependencies (if not already installed)
if [ -f "prototype/frontend/package.json" ]; then
    echo "📚 Installing frontend dependencies..."
    cd prototype/frontend
    npm install --legacy-peer-deps > /dev/null 2>&1 || true
    cd ../..
fi

# Install Maven dependencies (if not already installed)
if [ -f "prototype/backend/pom.xml" ]; then
    echo "📚 Installing backend dependencies..."
    cd prototype/backend
    mvn dependency:resolve > /dev/null 2>&1 || true
    cd ../..
fi

# Set up environment file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "✅ Dev container setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Start services: docker-compose up -d"
echo "  2. Check logs: docker-compose logs -f"
echo "  3. Backend API: http://localhost:8080"
echo "  4. Frontend: http://localhost:3001"
echo "  5. Database: localhost:5432"
