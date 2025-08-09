#!/bin/bash
echo "Setting up Flowise AI workflow platform..."

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

echo "Pulling Flowise Docker image..."
docker pull flowiseai/flowise

echo "Starting Flowise container..."
docker run -d \
  --name flowise \
  -p 3000:3000 \
  -v flowise_data:/root/.flowise \
  flowiseai/flowise

sleep 5

if docker ps | grep -q flowise; then
    echo "✅ Flowise is running successfully!"
    echo "🌐 Access the UI at: http://localhost:3000"
    echo "📚 Setup guide: docs/flowise-setup.md"
else
    echo "❌ Failed to start Flowise container"
    echo "Check Docker logs: docker logs flowise"
fi
