import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';

function SetupPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAPIInitialized, setAPIKey } = useStore();

  const handleSetup = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.initializeAPI(apiKey);

      if (result.success) {
        setAPIKey(apiKey);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🪄 Resume Polisher</h1>
          <p className="text-gray-400">
            AI-powered resume tailoring for job applications
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold mb-6">Setup</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSetup()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your API key is stored locally and never sent anywhere except Anthropic
              </p>
            </div>

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

          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-semibold mb-3 text-gray-400">What you'll need:</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>Anthropic Claude API key (<a href="#" onClick={(e) => {
                  e.preventDefault();
                  window.electronAPI.openExternal('https://console.anthropic.com');
                }} className="text-primary-400 hover:underline">Get one here</a>)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>Resume database (curator output)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>HTML resume template</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>Job posting URL</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPage;
