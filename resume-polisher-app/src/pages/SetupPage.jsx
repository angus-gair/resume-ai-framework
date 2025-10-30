import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';

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
      // Anthropic Models
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', cost: '$3/$15 per 1M' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: '$3/$15 per 1M' },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', cost: '$0.80/$4 per 1M' },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', cost: '$15/$75 per 1M' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', cost: '$3/$15 per 1M' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', cost: '$0.25/$1.25 per 1M' },

      // OpenAI Models
      { id: 'openai/gpt-4o', name: 'GPT-4o', cost: '$2.50/$10 per 1M' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', cost: '$0.15/$0.60 per 1M' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', cost: '$10/$30 per 1M' },
      { id: 'openai/gpt-4', name: 'GPT-4', cost: '$30/$60 per 1M' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: '$0.50/$1.50 per 1M' },
      { id: 'openai/o1-preview', name: 'o1 Preview', cost: '$15/$60 per 1M' },
      { id: 'openai/o1-mini', name: 'o1 Mini', cost: '$3/$12 per 1M' },
      { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', cost: '$0.05/$0.20 per 1M' },
      { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', cost: '$0.05/$0.20 per 1M' },
      { id: 'openai/gpt-oss-120b:exacto', name: 'GPT OSS 120B (exacto)', cost: '$0.05/$0.24 per 1M' },

      // Google Models
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', cost: '$1.25/$5 per 1M' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', cost: '$0.075/$0.30 per 1M' },
      { id: 'google/gemini-flash-1.5-8b', name: 'Gemini Flash 1.5 8B', cost: '$0.0375/$0.15 per 1M' },
      { id: 'google/gemini-pro', name: 'Gemini Pro', cost: '$0.125/$0.375 per 1M' },

      // Meta Llama Models
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', cost: '$0.35/$0.40 per 1M' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct', cost: '$2.70/$2.70 per 1M' },
      { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', cost: '$0.35/$0.40 per 1M' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', cost: '$0.055/$0.055 per 1M' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B Instruct', cost: '$0.59/$0.79 per 1M' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B Instruct', cost: '$0.055/$0.055 per 1M' },

      // Mistral Models
      { id: 'mistralai/mistral-large', name: 'Mistral Large', cost: '$2/$6 per 1M' },
      { id: 'mistralai/mistral-medium', name: 'Mistral Medium', cost: '$2.70/$8.10 per 1M' },
      { id: 'mistralai/mistral-small', name: 'Mistral Small', cost: '$0.20/$0.60 per 1M' },
      { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo', cost: '$0.15/$0.15 per 1M' },
      { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', cost: '$0.24/$0.24 per 1M' },
      { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B Instruct', cost: '$0.65/$0.65 per 1M' },
      { id: 'mistralai/codestral-mamba', name: 'Codestral Mamba', cost: '$0.25/$0.25 per 1M' },

      // Cohere Models
      { id: 'cohere/command-r-plus', name: 'Command R+', cost: '$2.50/$10 per 1M' },
      { id: 'cohere/command-r', name: 'Command R', cost: '$0.15/$0.60 per 1M' },

      // AI21 Models
      { id: 'ai21/jamba-1-5-large', name: 'Jamba 1.5 Large', cost: '$2/$8 per 1M' },
      { id: 'ai21/jamba-1-5-mini', name: 'Jamba 1.5 Mini', cost: '$0.20/$0.40 per 1M' },

      // Perplexity Models
      { id: 'perplexity/llama-3.1-sonar-large-128k-online', name: 'Sonar Large 128k Online', cost: '$1/$1 per 1M' },
      { id: 'perplexity/llama-3.1-sonar-small-128k-online', name: 'Sonar Small 128k Online', cost: '$0.20/$0.20 per 1M' },

      // DeepSeek Models
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', cost: '$0.14/$0.28 per 1M' },
      { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', cost: '$0.14/$0.28 per 1M' },

      // Qwen Models
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', cost: '$0.35/$0.40 per 1M' },
      { id: 'qwen/qwen-2.5-7b-instruct', name: 'Qwen 2.5 7B Instruct', cost: '$0.035/$0.040 per 1M' },
      { id: 'qwen/qwq-32b-preview', name: 'QwQ 32B Preview', cost: '$0.12/$0.12 per 1M' },

      // Inflection AI
      { id: 'inflection/inflection-3-pi', name: 'Inflection 3 Pi', cost: '$8/$8 per 1M' },
      { id: 'inflection/inflection-3-productivity', name: 'Inflection 3 Productivity', cost: '$8/$8 per 1M' },

      // Nvidia Models
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B Instruct', cost: '$0.35/$0.40 per 1M' },

      // X.AI Models
      { id: 'x-ai/grok-2-vision', name: 'Grok 2 Vision', cost: '$2/$10 per 1M' },
      { id: 'x-ai/grok-2', name: 'Grok 2', cost: '$2/$10 per 1M' },
      { id: 'x-ai/grok-beta', name: 'Grok Beta', cost: '$5/$15 per 1M' },

      // Moonshot AI Models
      { id: 'moonshotai/kimi-k2:free', name: 'Moonshot Kimi K2 (Free)', cost: 'Free' },
      { id: 'moonshotai/moonshot-v1-8k', name: 'Moonshot v1 8k', cost: '$0.12/$0.12 per 1M' },

      // Other Notable Models
      { id: 'databricks/dbrx-instruct', name: 'DBRX Instruct', cost: '$0.60/$0.60 per 1M' },
      { id: 'teknium/openhermes-2.5-mistral-7b', name: 'OpenHermes 2.5 Mistral 7B', cost: 'Free' },
      { id: 'undi95/toppy-m-7b', name: 'Toppy M 7B', cost: 'Free' },
      { id: 'nousresearch/hermes-3-llama-3.1-405b', name: 'Hermes 3 Llama 3.1 405B', cost: '$2.70/$2.70 per 1M' },
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
  xai: {
    name: 'xAI (Grok)',
    models: [
      { id: 'grok-2', name: 'Grok 2', cost: '$3/$12 per 1M tokens' },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', cost: '$0.75/$3 per 1M tokens' },
      { id: 'grok-beta', name: 'Grok Beta', cost: 'Variable' },
    ],
    keyPlaceholder: 'xai-...',
    baseURL: 'https://api.x.ai/v1',
    badge: 'REAL-TIME',
    badgeColor: 'bg-purple-500',
  },
  github: {
    name: 'GitHub Models',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', cost: 'Free (15/min, 150/day)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 'Free (15/min, 150/day)' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', cost: 'Free (15/min, 150/day)' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', cost: 'Free (15/min, 150/day)' },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', cost: 'Free (15/min, 150/day)' },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', cost: 'Free (15/min, 150/day)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', cost: 'Free (15/min, 150/day)' },
      { id: 'mistral-large', name: 'Mistral Large', cost: 'Free (15/min, 150/day)' },
    ],
    keyPlaceholder: 'github_pat_...',
    baseURL: 'https://models.inference.ai.azure.com',
    badge: 'FREE TIER',
    badgeColor: 'bg-emerald-500',
  },
  zhipuai: {
    name: 'ZhipuAI (GLM)',
    models: [
      { id: 'GLM-4.5-Flash', name: 'GLM-4.5-Flash', cost: '$0.10/$0.10 per 1M tokens' },
      { id: 'GLM-4-Plus', name: 'GLM-4-Plus', cost: '$0.50/$0.50 per 1M tokens' },
      { id: 'GLM-4', name: 'GLM-4', cost: '$1/$1 per 1M tokens' },
    ],
    keyPlaceholder: 'Your ZhipuAI API key...',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    badge: 'CHINA AI',
    badgeColor: 'bg-red-500',
  },
  mcp: {
    name: 'Claude Code MCP',
    models: [
      { id: 'claude-via-mcp', name: 'Claude (via MCP)', cost: 'Uses Claude Code quota' },
    ],
    keyPlaceholder: 'No API key needed',
    baseURL: 'http://100.64.204.61:8734',
    requiresKey: false,
    badge: 'ADVANCED',
    badgeColor: 'bg-cyan-500',
  },
};

function SetupPage() {
  const { setAPIInitialized, setAPIKey, setProvider, setModel, setBaseURL } = useStore();

  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(PROVIDERS.anthropic.models[0].id);
  const [customBaseURL, setCustomBaseURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    setSelectedModel(PROVIDERS[provider].models[0].id);
    setCustomBaseURL(PROVIDERS[provider].baseURL);
    setError('');
  };

  const handleSetup = async () => {
    // MCP provider doesn't require an API key
    if (!PROVIDERS[selectedProvider].requiresKey && !apiKey.trim()) {
      if (!PROVIDERS[selectedProvider].requiresKey === false) {
        // MCP: no key needed, proceed
      } else {
        setError('Please enter an API key');
        return;
      }
    } else if (PROVIDERS[selectedProvider].requiresKey !== false && !apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (selectedProvider === 'custom' && !customBaseURL.trim()) {
      setError('Please enter a custom base URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const baseURL = selectedProvider === 'custom' || selectedProvider === 'openrouter' || selectedProvider === 'xai' || selectedProvider === 'github' || selectedProvider === 'zhipuai' || selectedProvider === 'mcp'
        ? customBaseURL
        : PROVIDERS[selectedProvider].baseURL;

      const result = await window.electronAPI.initializeAPI({
        apiKey: apiKey || 'not-required', // MCP doesn't need key
        provider: selectedProvider,
        model: selectedModel,
        baseURL,
      });

      if (result.success) {
        setAPIKey(apiKey);
        setProvider(selectedProvider);
        setModel(selectedModel);
        setBaseURL(baseURL);
        setAPIInitialized(true);
      } else {
        setError(`Failed to initialize: ${result.error}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProvider = PROVIDERS[selectedProvider];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🪄 Resume Polisher</h1>
          <p className="text-gray-400">
            AI-powered resume tailoring for job applications
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">Setup LLM Provider</h2>

          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Select Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PROVIDERS).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => handleProviderChange(key)}
                    className={`p-4 rounded-lg border-2 transition text-left relative ${
                      selectedProvider === key
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{provider.name}</div>
                      {provider.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${provider.badgeColor} text-white font-bold`}>
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {provider.models.length} model{provider.models.length > 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
              >
                {currentProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.cost}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentProvider.keyPlaceholder}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSetup()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key is stored locally and only sent to {currentProvider.name}
              </p>
            </div>

            {/* Custom Base URL (for OpenRouter, Custom, xAI, GitHub, ZhipuAI, MCP) */}
            {(selectedProvider === 'openrouter' || selectedProvider === 'custom' || selectedProvider === 'xai' || selectedProvider === 'github' || selectedProvider === 'zhipuai' || selectedProvider === 'mcp') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Base URL
                </label>
                <input
                  type="text"
                  value={customBaseURL}
                  onChange={(e) => setCustomBaseURL(e.target.value)}
                  placeholder={PROVIDERS[selectedProvider].baseURL}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white font-mono text-sm"
                  disabled={selectedProvider !== 'custom' && selectedProvider !== 'mcp'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProvider === 'mcp' ? 'MCP server endpoint (default: Tailscale IP)' : 'API endpoint URL'}
                </p>
              </div>
            )}

            {/* GitHub Models Info */}
            {selectedProvider === 'github' && (
              <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="text-xl">🎁</span>
                  <div className="flex-1 text-sm text-emerald-200/90">
                    <div className="font-semibold mb-1">Free Tier Limits:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>15 requests per minute per model</li>
                      <li>150 requests per day per model</li>
                      <li>Perfect for prototyping and development!</li>
                    </ul>
                    <p className="mt-2 text-xs">Get your token at: <span className="font-mono">github.com/settings/tokens</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* xAI Info */}
            {selectedProvider === 'xai' && (
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="text-xl">⚡</span>
                  <div className="flex-1 text-sm text-purple-200/90">
                    <div className="font-semibold mb-1">xAI Grok Features:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Real-time information access</li>
                      <li>Long context window (up to 128k tokens)</li>
                      <li>Internet search integration (optional)</li>
                    </ul>
                    <p className="mt-2 text-xs">Get your key at: <span className="font-mono">console.x.ai</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* MCP Server Info */}
            {selectedProvider === 'mcp' && (
              <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4">
                <div className="flex gap-3">
                  <span className="text-xl">🔗</span>
                  <div className="flex-1 text-sm text-cyan-200/90">
                    <div className="font-semibold mb-1">MCP Server Requirements:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Requires Tailscale connection to MCP server</li>
                      <li>No API key needed (uses Claude Code instance)</li>
                      <li>Access to Claude Code agent capabilities</li>
                      <li>Rate limit: 100 requests per 15 minutes</li>
                    </ul>
                    <p className="mt-2 text-xs text-yellow-300">⚠️ Ensure server is running at: <span className="font-mono">{customBaseURL}</span></p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleSetup}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              Initialize API
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1 text-sm text-blue-200/80">
                <div className="font-semibold mb-1 text-blue-300">About Providers</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Anthropic:</strong> Best for resume generation (Claude models)</li>
                  <li><strong>OpenAI:</strong> GPT-4o and other OpenAI models</li>
                  <li><strong>OpenRouter:</strong> Access to 100+ models from multiple providers</li>
                  <li><strong>Custom:</strong> Any OpenAI-compatible API endpoint</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPage;
