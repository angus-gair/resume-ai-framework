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
    if (!apiKey.trim()) {
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
      const baseURL = selectedProvider === 'custom' || selectedProvider === 'openrouter'
        ? customBaseURL
        : PROVIDERS[selectedProvider].baseURL;

      const result = await window.electronAPI.initializeAPI({
        apiKey,
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
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedProvider === key
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold">{provider.name}</div>
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

            {/* Custom Base URL (for OpenRouter and Custom) */}
            {(selectedProvider === 'openrouter' || selectedProvider === 'custom') && (
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  API endpoint URL
                </p>
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
