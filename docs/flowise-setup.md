# Flowise Cannabis Knowledge Workflow Setup

## 1. Access Flowise UI
Navigate to http://localhost:3000 after running the Docker container.

## 2. Create Cannabis Knowledge Workflow

### Components to Add:
1. **Document Loader**
   - Load cannabis-knowledge.json
   - Load product data from products.json

2. **Text Splitter**
   - Chunk size: 1000
   - Overlap: 200

3. **Embeddings**
   - Use OpenAI Embeddings
   - Model: text-embedding-ada-002

4. **Vector Store**
   - Use Pinecone or Chroma
   - Store cannabis knowledge embeddings

5. **Chat Model**
   - OpenAI GPT-3.5-turbo
   - Temperature: 0.7
   - System prompt: "You are a cannabis expert assistant for RiseViA..."

6. **Retrieval QA Chain**
   - Connect vector store to chat model
   - Return source documents

## 3. Configure API Endpoint
- Enable API access
- Note the workflow API URL
- Update VITE_FLOWISE_API_URL in environment

## 4. Test Workflow
Test queries:
- "What are the effects of sativa strains?"
- "Recommend a strain for creativity"
- "What is THCA?"
- "Tell me about Blue Dream"

## 5. Integration
The aiService.ts will call the Flowise API endpoint for enhanced responses.

## 6. Docker Setup Commands
```bash
# Pull and run Flowise container
docker run -d \
  --name flowise \
  -p 3000:3000 \
  -v flowise_data:/root/.flowise \
  flowiseai/flowise

# Check container status
docker ps

# View logs
docker logs flowise

# Stop container
docker stop flowise

# Remove container
docker rm flowise
```

## 7. Environment Variables
Add to your .env file:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_FLOWISE_API_URL=http://localhost:3000
```

## 8. Cannabis Compliance Guidelines
- No medical claims in generated content
- Age-appropriate language only
- Include legal disclaimers
- State-specific restrictions
- FDA disclaimer required
- THCA vs THC education focus
