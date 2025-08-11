#!/bin/bash

echo "🚀 Setting up Flowise for RiseViA AI Assistant..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys and configuration."
fi

echo "🐳 Starting Flowise container..."
docker-compose up -d flowise

echo "⏳ Waiting for Flowise to start..."
sleep 10

if curl -f http://localhost:3000/api/v1/ping > /dev/null 2>&1; then
    echo "✅ Flowise is running successfully!"
    echo "🌐 Access Flowise at: http://localhost:3000"
    echo "🔑 Default credentials: admin/admin123"
    echo ""
    echo "📚 Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Login with admin/admin123"
    echo "3. Create cannabis knowledge workflows"
    echo "4. Configure API endpoints for chat and content generation"
    echo "5. Update .env.local with your Flowise API key"
else
    echo "❌ Flowise failed to start. Check Docker logs:"
    docker logs flowise
    exit 1
fi
