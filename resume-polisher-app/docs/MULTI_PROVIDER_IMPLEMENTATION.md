# Multi-Provider LLM Implementation

## Overview
The Resume Polisher App now supports multiple LLM providers beyond Anthropic Claude. Users can select from:
- **Anthropic** (Claude models)
- **OpenAI** (GPT models)
- **OpenRouter** (100+ models via proxy)
- **Custom** (Any OpenAI-compatible endpoint)

## Implementation Details

### Frontend Changes

#### 1. SetupPage.jsx (Complete Rewrite)
- Added provider selection UI with 4 provider options
- Model dropdown with pricing information
- Base URL configuration for OpenRouter and Custom endpoints
- Provider-specific placeholders and validation

**Provider Configuration:**
```javascript
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', cost: '$3/$15 per 1M tokens' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', cost: '$3/$15 per 1M tokens' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', cost: '$1/$5 per 1M tokens' },
    ],
    keyPlaceholder: 'sk-ant-...',
    baseURL: '',
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', cost: '$2.50/$10 per 1M tokens' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: '$0.15/$0.60 per 1M tokens' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: '$10/$30 per 1M tokens' },
    ],
    keyPlaceholder: 'sk-...',
    baseURL: '',
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4 (via OpenRouter)', cost: 'Variable' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', cost: 'Variable' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', cost: 'Variable' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', cost: 'Variable' },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', cost: 'Variable' },
    ],
    keyPlaceholder: 'sk-or-...',
    baseURL: 'https://openrouter.ai/api/v1',
  },
  custom: {
    name: 'Custom (OpenAI Compatible)',
    models: [
      { id: 'custom-model', name: 'Custom Model', cost: 'Provider dependent' },
    ],
    keyPlaceholder: 'Your API key...',
    baseURL: 'https://api.example.com/v1',
  },
};
```

#### 2. useStore.js Updates
Added new state variables:
```javascript
// API state
provider: 'anthropic',
model: 'claude-sonnet-4-5',
baseURL: '',

// Usage tracking
usage: null, // { inputTokens, outputTokens, totalTokens, costUSD }
```

New actions:
```javascript
setProvider: (provider) => set({ provider }),
setModel: (model) => set({ model }),
setBaseURL: (baseURL) => set({ baseURL }),
```

### Backend Changes

#### 1. main.js - Core Updates

**New Dependencies:**
```javascript
const OpenAI = require('openai');
```

**Global Variables:**
```javascript
let llmClient;      // Was: anthropicClient
let llmProvider;    // NEW
let llmModel;       // NEW
```

**Unified Initialization Function:**
```javascript
function initializeLLM(config) {
  llmProvider = config.provider;
  llmModel = config.model;

  if (config.provider === 'anthropic') {
    llmClient = new Anthropic({
      apiKey: config.apiKey
    });
  } else {
    // OpenAI, OpenRouter, and Custom all use OpenAI SDK
    const openaiConfig = {
      apiKey: config.apiKey,
    };
    if (config.baseURL) {
      openaiConfig.baseURL = config.baseURL;
    }
    llmClient = new OpenAI(openaiConfig);
  }
}
```

**Unified Streaming Function:**
```javascript
async function streamLLMCompletion(prompt, maxTokens, onChunk, onProgress) {
  let fullText = '';
  let inputTokens = 0;
  let outputTokens = 0;

  if (llmProvider === 'anthropic') {
    // Anthropic-specific streaming
    const stream = await llmClient.messages.stream({
      model: llmModel,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullText += text;
        if (onChunk) onChunk(text, fullText.length);
      } else if (chunk.type === 'message_start') {
        inputTokens = chunk.message.usage.input_tokens;
      } else if (chunk.type === 'message_delta') {
        outputTokens = chunk.usage.output_tokens;
      }
    }
  } else {
    // OpenAI-compatible streaming
    const stream = await llmClient.chat.completions.create({
      model: llmModel,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullText += text;
        if (onChunk) onChunk(text, fullText.length);
      }

      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }
    }

    // If usage wasn't in stream, estimate it
    if (!inputTokens) {
      inputTokens = Math.ceil(prompt.length / 4);
      outputTokens = Math.ceil(fullText.length / 4);
    }
  }

  return { fullText, inputTokens, outputTokens };
}
```

**Provider-Aware Cost Calculation:**
```javascript
function calculateCost(inputTokens, outputTokens, provider, model) {
  const pricing = {
    anthropic: {
      'claude-sonnet-4-5': { input: 3, output: 15 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-5-haiku-20241022': { input: 1, output: 5 },
    },
    openai: {
      'gpt-4o': { input: 2.5, output: 10 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-turbo': { input: 10, output: 30 },
    },
    openrouter: {
      default: { input: 3, output: 15 }
    },
    custom: {
      default: { input: 0, output: 0 }
    }
  };

  let modelPricing;
  if (pricing[provider] && pricing[provider][model]) {
    modelPricing = pricing[provider][model];
  } else if (pricing[provider] && pricing[provider].default) {
    modelPricing = pricing[provider].default;
  } else {
    modelPricing = { input: 0, output: 0 };
  }

  const costInput = (inputTokens / 1000000) * modelPricing.input;
  const costOutput = (outputTokens / 1000000) * modelPricing.output;
  return costInput + costOutput;
}
```

#### 2. Updated IPC Handlers

**initialize-api Handler:**
```javascript
ipcMain.handle('initialize-api', async (event, config) => {
  try {
    initializeLLM(config);

    // Test the API with a simple request
    if (config.provider === 'anthropic') {
      await llmClient.messages.create({
        model: config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
    } else {
      await llmClient.chat.completions.create({
        model: config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**generate-tailored-resume Handler:**
- Replaced Anthropic-specific streaming with unified `streamLLMCompletion()` calls
- Updated progress messages to show provider name dynamically
- Used provider-aware cost calculation

## Usage

### 1. Setup
Users select their provider, model, and enter API key on the Setup page.

### 2. API Initialization
The app tests the connection with a simple API call before allowing generation.

### 3. Resume Generation
The unified streaming function handles all providers transparently.

### 4. Cost Tracking
Costs are calculated based on the selected provider's pricing.

## Benefits

1. **Flexibility**: Users can choose the best model for their needs and budget
2. **Cost Optimization**: Access to cheaper models (GPT-4o Mini, Claude Haiku)
3. **Feature Access**: Access to different model capabilities (Gemini, Llama)
4. **Reliability**: Fallback to different providers if one is down
5. **Future-Proof**: Easy to add new providers or models

## Testing

To test different providers:

1. **Anthropic Claude:**
   - Provider: Anthropic
   - Model: claude-sonnet-4-5
   - API Key: sk-ant-...

2. **OpenAI:**
   - Provider: OpenAI
   - Model: gpt-4o
   - API Key: sk-...

3. **OpenRouter:**
   - Provider: OpenRouter
   - Model: anthropic/claude-sonnet-4
   - API Key: sk-or-...
   - Base URL: https://openrouter.ai/api/v1

4. **Custom (e.g., LM Studio):**
   - Provider: Custom
   - Model: local-model
   - API Key: (any value)
   - Base URL: http://localhost:1234/v1

## Future Enhancements

1. **Model Auto-Discovery**: Fetch available models from provider APIs
2. **Usage Analytics**: Track usage across providers over time
3. **Cost Alerts**: Notify when spending exceeds threshold
4. **Model Comparison**: Side-by-side quality comparison
5. **Batch Processing**: Queue multiple resumes with different providers
