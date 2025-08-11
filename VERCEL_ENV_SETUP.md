# 🔒 Secure Environment Variables Setup for Vercel

## ⚠️ Important Security Notice

**NEVER use `VITE_` prefix for sensitive API keys!** 

Variables with `VITE_` prefix are exposed to the browser and visible to anyone. This is a CRITICAL security issue for API keys.

## ✅ Correct Environment Variable Setup

### In Vercel Dashboard:

1. **For Neon Database (Client-safe):**
   ```
   Key: VITE_DATABASE_URL
   Value: postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```
   ✅ This is OK to expose since Neon uses Row Level Security

2. **For OpenAI API (Server-only):**
   ```
   Key: OPENAI_API_KEY  (NO VITE_ PREFIX!)
   Value: sk-...your-openai-key...
   ```
   ⚠️ **DO NOT use VITE_OPENAI_API_KEY** - this would expose your key!

3. **For Payment Processors (Server-only):**
   ```
   POSABIT_API_KEY=...
   POSABIT_SECRET=...
   AEROPAY_API_KEY=...
   AEROPAY_SECRET=...
   HYPUR_API_KEY=...
   HYPUR_SECRET=...
   ```
   ⚠️ Never prefix payment keys with VITE_

## 🏗️ Architecture Changes Made

### Before (INSECURE):
```javascript
// ❌ BAD - API key exposed in browser
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY // EXPOSED!
});
```

### After (SECURE):
```javascript
// ✅ GOOD - API calls go through server
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({ message })
});
```

## 📁 New Files Created

1. **`/api/ai-chat.js`** - Serverless function that handles OpenAI calls
   - Runs on Vercel's servers
   - Keeps API key secure
   - Never exposes credentials

## 🚀 How It Works Now

```mermaid
graph LR
    A[Browser/Client] -->|POST request| B[/api/ai-chat]
    B -->|Uses OPENAI_API_KEY| C[OpenAI API]
    C -->|Response| B
    B -->|Safe response| A
```

1. User interacts with ChatBot in browser
2. Browser sends request to `/api/ai-chat` endpoint
3. Vercel serverless function uses `OPENAI_API_KEY` (server-side only)
4. OpenAI responds to server
5. Server sends safe response back to browser

## ✅ Deployment Steps

1. **Remove** the `VITE_OPENAI_API_KEY` variable from Vercel
2. **Add** `OPENAI_API_KEY` (without VITE_ prefix)
3. **Save** and **Redeploy**

## 🔍 Quick Security Check

Run this in your browser console on the deployed site:
```javascript
console.log(import.meta.env.VITE_OPENAI_API_KEY); 
// Should be undefined ✅

console.log(import.meta.env.VITE_DATABASE_URL); 
// This is OK to see (Neon has RLS) ✅
```

## 📝 Summary

- ✅ **VITE_DATABASE_URL** - Safe to expose (database has security)
- ❌ **VITE_OPENAI_API_KEY** - NEVER do this
- ✅ **OPENAI_API_KEY** - Correct (server-only)
- ✅ **Payment keys** - Never prefix with VITE_

Your OpenAI API key is now secure and will only be used on Vercel's servers, never exposed to browsers!
