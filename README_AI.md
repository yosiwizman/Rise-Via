# AI Assistant Implementation

This document describes the AI-powered chatbot and content generation system implemented for the RiseViA cannabis e-commerce platform.

## Features Implemented

### 1. Floating Chat Widget
- **Location**: Available on all pages via `ChatBot.tsx`
- **Functionality**: Cannabis education, strain information, product recommendations
- **Compliance**: All responses include required disclaimers and age-appropriate content

### 2. Admin Content Generator
- **Location**: Admin Panel → AI Content tab
- **Features**:
  - Product description generation
  - Blog post creation
  - Meta description optimization
  - Compliance checking tool

### 3. Cannabis Knowledge Base
- **File**: `data/cannabis-knowledge.json`
- **Content**: Strain types, terpenes, consumption methods, dosing guidelines, legal information

### 4. Compliance System
- **File**: `src/utils/aiCompliance.ts`
- **Features**: Content validation, automatic disclaimers, forbidden term filtering

## Technical Implementation

### AI Service Layer
- **File**: `src/services/AIService.ts`
- **Integration**: Flowise API for AI processing
- **Fallbacks**: Local fallback responses when API unavailable

### Flowise Integration
- **Docker**: `docker-compose.yml` for easy setup
- **Configuration**: Environment variables for API keys
- **Endpoints**: Chat, product description, blog post generation

### Compliance Features
- Automatic disclaimer addition
- Medical claim prevention
- Age-appropriate content filtering
- State-specific legal language

## Setup Instructions

1. **Start Flowise**:
   ```bash
   docker-compose up -d flowise
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Update with your API keys
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Testing

### Chat Widget
- Test cannabis-related questions
- Verify compliance disclaimers
- Check product recommendations

### Content Generation
- Generate product descriptions
- Create blog posts
- Test compliance checking

### Admin Panel
- Access AI Content tab
- Test all generation features
- Verify compliance alerts

## Compliance Requirements

All AI-generated content includes:
- FDA disclaimer
- Age restrictions (21+)
- Safety warnings
- Educational purpose statements

Forbidden terms are automatically replaced with compliant alternatives.

## Files Created/Modified

### New Files
- `src/components/ChatBot.tsx`
- `src/components/admin/AIContentGenerator.tsx`
- `src/components/admin/ComplianceChecker.tsx`
- `src/services/AIService.ts`
- `src/hooks/useFlowise.ts`
- `src/utils/aiCompliance.ts`
- `data/cannabis-knowledge.json`
- `docker-compose.yml`
- `docs/AI_SETUP.md`

### Modified Files
- `src/App.tsx` - Added ChatBot component
- `src/pages/AdminPage.tsx` - Added AI Content tab
- `package.json` - Added AI dependencies

## Dependencies Added
- `langchain`: LangChain framework
- `@langchain/openai`: OpenAI integration
- `openai`: OpenAI API client

## Future Enhancements
- Vector database integration
- Advanced strain recommendations
- Multi-language support
- Voice chat capabilities
