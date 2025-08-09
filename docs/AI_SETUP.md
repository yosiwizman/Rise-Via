# AI Assistant Setup Guide

## Overview
This guide covers the setup and configuration of the AI-powered chatbot and content generation system for the RiseViA cannabis e-commerce platform.

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ and npm
- OpenAI API key (optional, for enhanced AI features)

## Flowise Setup

### 1. Start Flowise Container
```bash
# Using Docker Compose (recommended)
docker-compose up -d flowise

# Or using Docker directly
docker run -d -p 3000:3000 --name flowise flowiseai/flowise
```

### 2. Access Flowise Dashboard
- Open http://localhost:3000 in your browser
- Default credentials: admin/admin123 (change in production)

### 3. Configure Cannabis Knowledge Workflows
1. Create a new chatflow in Flowise
2. Import the cannabis knowledge base from `data/cannabis-knowledge.json`
3. Set up embeddings for strain data and effects
4. Configure the chat interface endpoint

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Flowise Configuration
VITE_FLOWISE_URL=http://localhost:3000
VITE_FLOWISE_API_KEY=your_flowise_api_key

# OpenAI Configuration (optional)
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Features

### 1. Chat Widget
- Floating chat widget on all pages
- Cannabis education and strain information
- Product recommendations
- Compliance-aware responses

### 2. Admin Content Generator
- Product description generation
- Blog post creation
- Meta description optimization
- Compliance rule enforcement

### 3. Cannabis Knowledge Base
- Strain information and effects
- Terpene profiles
- Consumption methods
- Dosing guidelines
- Legal information

## Compliance Features

### Automatic Disclaimers
All AI-generated content includes:
- "This product has not been evaluated by the FDA"
- "Not for use by minors, pregnant or nursing women"
- "Keep out of reach of children and pets"
- "Educational information only, not medical advice"

### Content Filtering
- No medical claims
- Age-appropriate language
- State-specific legal disclaimers
- Cannabis industry regulations compliance

## Testing

### 1. Test Chat Widget
```bash
npm run dev
# Navigate to any page and test the chat widget
```

### 2. Test Content Generation
1. Go to Admin Panel → AI Content
2. Test product description generation
3. Test blog post creation
4. Verify compliance disclaimers

### 3. Test Flowise Connection
```bash
curl http://localhost:3000/api/v1/ping
```

## Troubleshooting

### Flowise Not Responding
1. Check Docker container status: `docker ps`
2. Check container logs: `docker logs flowise`
3. Restart container: `docker restart flowise`

### Chat Widget Not Loading
1. Check browser console for errors
2. Verify environment variables
3. Test Flowise API connection

### Content Generation Failing
1. Check OpenAI API key configuration
2. Verify Flowise workflow setup
3. Check network connectivity

## Production Deployment

### Security Considerations
1. Change default Flowise credentials
2. Use environment-specific API keys
3. Enable HTTPS for all API calls
4. Implement rate limiting

### Performance Optimization
1. Use Redis for caching responses
2. Implement response streaming
3. Optimize knowledge base embeddings
4. Monitor API usage and costs

## API Endpoints

### Chat Interface
- `POST /api/v1/prediction/chat`
- Handles general cannabis questions and product recommendations

### Content Generation
- `POST /api/v1/prediction/product-description`
- `POST /api/v1/prediction/blog-post`
- `POST /api/v1/prediction/meta`

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Flowise documentation
3. Check browser console for errors
4. Contact development team
