import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';

function GeneratePage() {
  const {
    requirements,
    templateHtml,
    database,
    setResults,
    setCurrentPage,
    generationProgress,
    setGenerationState,
    canProceedToGenerate,
  } = useStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [logs, setLogs] = useState([]);
  const [aiOutput, setAiOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const logsEndRef = useRef(null);
  const aiOutputEndRef = useRef(null);

  useEffect(() => {
    window.electronAPI.onGenerationProgress((data) => {
      setProgress(data.progress || 0);
      setStage(data.stage || '');

      if (data.log) {
        setLogs((prev) => {
          const timestamp = new Date().toLocaleTimeString('en-AU', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          return [...prev, { time: timestamp, message: data.log }];
        });
      }

      // Handle streaming
      if (data.streamStart) {
        setIsStreaming(true);
        setAiOutput('');
      }

      if (data.streamChunk) {
        setAiOutput(prev => prev + data.streamChunk);
      }

      if (data.streamEnd) {
        setIsStreaming(false);
      }
    });

    return () => {
      window.electronAPI.removeGenerationProgressListener();
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Auto-scroll AI output when streaming
  useEffect(() => {
    if (aiOutputEndRef.current && isStreaming) {
      aiOutputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiOutput, isStreaming]);

  const handleGenerate = async () => {
    if (!canProceedToGenerate()) {
      setError('Missing required configuration. Please complete previous steps.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setProgress(0);
    setLogs([]);
    setAiOutput('');
    setIsStreaming(false);

    try {
      const result = await window.electronAPI.generateTailoredResume({
        requirements,
        templateHtml,
        database,
      });

      if (result.success) {
        setResults(
          result.tailoredHtml,
          result.recruiterMessage,
          result.generatedAt,
          result.usage
        );
        setCurrentPage('review');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Generate Tailored Resume</h2>
        <p className="text-gray-400">
          AI will analyze the job requirements and customize your resume
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h3 className="text-lg font-semibold mb-4">Ready to Generate</h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">Job requirements extracted</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">Resume template loaded</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-300">
              Database loaded ({database.index.query_paths.get_top_achievements_by_impact.length} achievements available)
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {isGenerating ? (
          <div className="space-y-4">
            <ProgressBar
              progress={progress}
              stage={stage}
              label="Generating tailored resume"
            />

            <div className="space-y-4">
              {/* Console Logs */}
              <div className="bg-slate-900 p-4 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Console Output:</h4>
                  <span className="text-xs text-gray-500">
                    {logs.length} log{logs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bg-black/40 rounded p-3 max-h-48 overflow-y-auto font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-gray-500 italic">Waiting for process to start...</div>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="text-green-400">
                          <span className="text-gray-500">[{log.time}]</span> {log.message}
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </div>

              {/* AI Live Output */}
              {(isStreaming || aiOutput) && (
                <div className="bg-slate-900 p-4 rounded border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      🤖 AI Output:
                      {isStreaming && (
                        <span className="flex items-center gap-1 text-xs text-cyan-400">
                          <span className="animate-pulse">●</span> Streaming...
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {aiOutput.length.toLocaleString()} chars
                    </span>
                  </div>
                  <div className="bg-black/40 rounded p-3 max-h-96 overflow-y-auto font-mono text-xs">
                    {aiOutput ? (
                      <div>
                        <div className="text-cyan-300 whitespace-pre-wrap break-words">
                          {aiOutput}
                          {isStreaming && <span className="animate-pulse">▊</span>}
                        </div>
                        <div ref={aiOutputEndRef} />
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Waiting for AI to start generating...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            icon="✨"
            size="lg"
            fullWidth
          >
            Generate Tailored Resume
          </Button>
        )}
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold mb-1 text-blue-300">How it works</h4>
            <p className="text-sm text-blue-200/80">
              The AI agent will analyze the job requirements and intelligently select
              the most relevant achievements, skills, and experiences from your database.
              It emphasizes quantified metrics, maintains evidence-based claims, and
              ensures Australian English compliance throughout.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between mt-8">
        <Button
          onClick={() => setCurrentPage('configure')}
          variant="ghost"
          disabled={isGenerating}
        >
          ← Back to Configure
        </Button>
      </div>
    </div>
  );
}

export default GeneratePage;
