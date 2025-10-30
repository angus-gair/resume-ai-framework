import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { marked } from 'marked';

function ExtractPage() {
  const {
    jobUrl,
    setJobUrl,
    requirements,
    setRequirements,
    setCurrentPage,
    scrapingProgress,
    setScrapingProgress,
    extractionProgress,
    setExtractionProgress,
  } = useStore();

  const [inputMode, setInputMode] = useState('url'); // 'url' or 'paste'
  const [localUrl, setLocalUrl] = useState(jobUrl);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Setup progress listeners
    window.electronAPI.onScrapingProgress(setScrapingProgress);
    window.electronAPI.onExtractionProgress(setExtractionProgress);

    return () => {
      window.electronAPI.removeScrapingProgressListener();
      window.electronAPI.removeExtractionProgressListener();
    };
  }, []);

  const handleExtractFromUrl = async () => {
    if (!localUrl.trim()) {
      setError('Please enter a job URL');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Scrape the URL
      const scrapeResult = await window.electronAPI.scrapeJobUrl(localUrl);

      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error);
      }

      // Step 2: Extract requirements using Claude
      const extractResult = await window.electronAPI.extractRequirements({
        jobUrl: localUrl,
        pageContent: scrapeResult.content,
      });

      if (!extractResult.success) {
        throw new Error(extractResult.error);
      }

      setJobUrl(localUrl);
      setRequirements(extractResult.requirements, extractResult.metadata);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractFromPaste = async () => {
    if (!pastedText.trim()) {
      setError('Please paste job description text');
      return;
    }

    if (pastedText.length < 100) {
      setError('Job description seems too short. Please paste the full description.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Extract requirements directly from pasted text
      const extractResult = await window.electronAPI.extractRequirements({
        jobUrl: 'Pasted Text',
        pageContent: pastedText,
      });

      if (!extractResult.success) {
        throw new Error(extractResult.error);
      }

      setJobUrl('Pasted Text');
      setRequirements(extractResult.requirements, extractResult.metadata);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    setCurrentPage('configure');
  };

  const getTotalProgress = () => {
    if (scrapingProgress.progress) return scrapingProgress.progress / 2;
    if (extractionProgress.progress) return 50 + extractionProgress.progress / 2;
    return 0;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Extract Job Requirements</h2>
        <p className="text-gray-400">
          Provide job details either via URL or by pasting the text
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          onClick={() => setInputMode('url')}
          variant={inputMode === 'url' ? 'primary' : 'ghost'}
          size="sm"
          icon="🔗"
        >
          From URL
        </Button>
        <Button
          onClick={() => setInputMode('paste')}
          variant={inputMode === 'paste' ? 'primary' : 'ghost'}
          size="sm"
          icon="📋"
        >
          Paste Text
        </Button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        {inputMode === 'url' ? (
          /* URL Input Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Job Posting URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="https://www.seek.com.au/job/..."
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleExtractFromUrl()}
                />
                <Button
                  onClick={handleExtractFromUrl}
                  loading={isProcessing}
                  icon="🔍"
                  disabled={isProcessing}
                >
                  Extract
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supports Seek, LinkedIn, Indeed, and most job boards
              </p>
            </div>
          </div>
        ) : (
          /* Paste Text Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Paste Job Description
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full job description here... (minimum 100 characters)"
                disabled={isProcessing}
                rows={12}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white disabled:opacity-50 resize-y"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Copy the job posting from the website and paste it here
                </p>
                <span className="text-xs text-gray-500">
                  {pastedText.length} characters
                </span>
              </div>
            </div>
            <Button
              onClick={handleExtractFromPaste}
              loading={isProcessing}
              icon="✨"
              disabled={isProcessing || pastedText.length < 100}
              fullWidth
            >
              Extract Requirements from Text
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4 mt-4">
            <ProgressBar
              progress={getTotalProgress()}
              stage={scrapingProgress.stage || extractionProgress.stage}
              label={inputMode === 'url' ? 'Processing job posting' : 'Analyzing job description'}
            />
          </div>
        )}
      </div>

      {requirements && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Extracted Requirements</h3>
              <Button
                onClick={handleNext}
                icon="→"
                size="sm"
              >
                Continue to Configure
              </Button>
            </div>

            <div
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(requirements) }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(requirements);
              }}
              variant="secondary"
              icon="📋"
            >
              Copy to Clipboard
            </Button>

            <Button
              onClick={async () => {
                const result = await window.electronAPI.selectDirectory();
                if (result.success) {
                  await window.electronAPI.writeFile(
                    `${result.path}/POSITION-REQUIREMENTS.md`,
                    requirements
                  );
                }
              }}
              variant="secondary"
              icon="💾"
            >
              Save as File
            </Button>

            <Button
              onClick={() => {
                setRequirements('', null);
                setJobUrl('');
                setLocalUrl('');
                setPastedText('');
              }}
              variant="ghost"
            >
              Extract Different Job
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExtractPage;
