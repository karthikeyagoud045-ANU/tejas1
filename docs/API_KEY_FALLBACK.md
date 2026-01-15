# API Key Fallback System

## Overview
The HealthWise AI application now includes a robust API key fallback system that automatically switches between multiple API keys when one fails. This ensures high availability and reliability of the application.

## Configured API Keys

### 1. **Gemini API** (Primary)
- **Provider**: Google Gemini
- **Key**: Stored in environment variable `REACT_APP_GEMINI_KEY`
- **Usage**: Medical report analysis, meal analysis, chat, and transcription

### 2. **OpenRouter API Keys**
- **Primary**: Stored in environment variable `REACT_APP_OPENROUTER_KEY_1`
- **Secondary**: Stored in environment variable `REACT_APP_OPENROUTER_KEY_2`
- **Usage**: Fallback for AI operations

### 3. **Groq API Keys**
- **Primary**: Stored in environment variable `REACT_APP_GROQ_KEY_1`
- **Secondary**: Stored in environment variable `REACT_APP_GROQ_KEY_2`
- **Usage**: Additional fallback for AI operations

## How It Works

### Automatic Fallback
When an API call fails, the system automatically:
1. Logs the failure with the current API key
2. Switches to the next available API key
3. Retries the operation
4. Continues until success or all keys are exhausted

### Key Features
- **Transparent**: No code changes needed in components
- **Automatic**: Switches happen automatically on failure
- **Logged**: All failures and switches are logged to console
- **Resilient**: Tries all available keys before giving up

## Implementation Details

### Configuration File
Location: `/config/apiKeys.ts`

This file contains:
- Array of all API keys with metadata
- Functions to get current key
- Functions to switch to next key
- `withAPIKeyFallback()` wrapper function

### Usage in Services

#### Medical Report Analysis
```typescript
return await withAPIKeyFallback(async (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  // ... perform analysis
});
```

#### Meal Analysis
```typescript
return await withAPIKeyFallback(async (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  // ... perform analysis
});
```

#### Chat & Transcription
```typescript
const apiKey = getCurrentAPIKey().key;
const ai = new GoogleGenAI({ apiKey });
```

## Monitoring

### Console Logs
The system logs important events:
- `Attempting API call with: [Key Name]`
- `API call failed with [Key Name]: [Error]`
- `Switched to fallback API key: [Key Name]`
- `Successfully recovered using fallback key: [Key Name]`
- `All API keys have failed`

### Error Handling
If all API keys fail:
- Medical report analysis returns a safe default response
- Meal analysis throws an error
- Chat/transcription will show connection errors

## Adding New API Keys

To add more API keys:

1. **Update `config/apiKeys.ts`**:
```typescript
export const API_KEYS: APIKeyConfig[] = [
  // ... existing keys
  {
    key: 'your-new-api-key',
    provider: 'openrouter' | 'groq' | 'gemini',
    name: 'Descriptive Name'
  }
];
```

2. **Update `index.html`** (for browser access):
```javascript
window.process = {
  env: {
    // ... existing keys
    YOUR_NEW_KEY: 'your-new-api-key'
  }
};
```

## Resetting Failed Keys

The system tracks which keys have failed. To reset this tracking:

```typescript
import { resetFailedKeys } from '../config/apiKeys';

// Reset all failure tracking
resetFailedKeys();
```

This is useful for periodic retries or after resolving API issues.

## Security Notes

⚠️ **Important**: API keys are currently stored in the codebase. For production:
- Move keys to environment variables
- Use a secure key management service
- Implement key rotation
- Monitor API usage and costs

## Troubleshooting

### All Keys Failing
1. Check console logs for specific error messages
2. Verify API key validity on provider dashboards
3. Check API rate limits and quotas
4. Ensure network connectivity

### Specific Provider Issues
- **Gemini**: Check Google AI Studio for key status
- **OpenRouter**: Verify account balance and limits
- **Groq**: Check Groq console for API status

## Benefits

✅ **High Availability**: Service continues even if one API fails  
✅ **Automatic Recovery**: No manual intervention needed  
✅ **Cost Optimization**: Distribute load across providers  
✅ **Flexibility**: Easy to add/remove API keys  
✅ **Monitoring**: Clear logs for debugging
