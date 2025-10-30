import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import ResumeEditor from '../components/ResumeEditor';

function ReviewPage() {
  const {
    tailoredHtml,
    recruiterMessage,
    generatedAt,
    outputDirectory,
    usage,
    resetForNewJob,
  } = useStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [editedMessage, setEditedMessage] = useState(recruiterMessage);
  const [editedHtml, setEditedHtml] = useState(tailoredHtml);
  const [editHistory, setEditHistory] = useState([]);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'edit'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recruiterCollapsed, setRecruiterCollapsed] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [stepsCollapsed, setStepsCollapsed] = useState(true);

  const handleSaveHTML = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume-tailored-${timestamp}.html`;
      const outputPath = `${outputDirectory}/${filename}`;

      const result = await window.electronAPI.saveResume({
        html: editedHtml,
        outputPath,
      });

      if (result.success) {
        setSaveStatus(`✓ Saved: ${filename}`);
      } else {
        setSaveStatus(`✗ Error: ${result.error}`);
      }
    } catch (err) {
      setSaveStatus(`✗ Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    setSaveStatus('');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume-tailored-${timestamp}.pdf`;
      const outputPath = `${outputDirectory}/${filename}`;

      const result = await window.electronAPI.exportPDF({
        html: editedHtml,
        outputPath,
      });

      if (result.success) {
        setSaveStatus(`✓ PDF saved: ${filename}`);
      } else {
        setSaveStatus(`✗ PDF error: ${result.error}`);
      }
    } catch (err) {
      setSaveStatus(`✗ PDF error: ${err.message}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(editedMessage);
    setSaveStatus('✓ Recruiter message copied to clipboard');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleSaveBoth = async () => {
    await handleSaveHTML();
    await handleExportPDF();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Review & Export</h2>
            <div className="flex gap-1 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 text-sm rounded transition ${
                  viewMode === 'preview'
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👁️ Preview
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 text-sm rounded transition ${
                  viewMode === 'edit'
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ✏️ Edit
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size="sm"
              variant="secondary"
              icon={sidebarOpen ? '👉' : '👈'}
            >
              {sidebarOpen ? 'Hide' : 'Show'} Panel
            </Button>
            <Button
              onClick={handleSaveHTML}
              loading={isSaving}
              size="sm"
              icon="💾"
            >
              Save HTML
            </Button>
            <Button
              onClick={handleExportPDF}
              loading={isExportingPDF}
              size="sm"
              variant="secondary"
              icon="📄"
            >
              Export PDF
            </Button>
            <Button
              onClick={handleSaveBoth}
              loading={isSaving || isExportingPDF}
              size="sm"
              icon="💾"
            >
              Save Both
            </Button>
            <Button
              onClick={resetForNewJob}
              variant="ghost"
              size="sm"
              icon="🔄"
            >
              New Job
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        {saveStatus && (
          <div className={`mt-3 p-2 rounded text-sm ${
            saveStatus.startsWith('✓')
              ? 'bg-green-900/30 border border-green-700 text-green-300'
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}>
            {saveStatus}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Resume Preview/Editor - Takes full width when sidebar closed */}
        <div className={`flex-1 bg-white overflow-hidden transition-all ${
          sidebarOpen ? '' : 'w-full'
        }`}>
          {viewMode === 'preview' ? (
            <iframe
              srcDoc={editedHtml}
              className="w-full h-full"
              title="Resume Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <ResumeEditor
              initialHtml={editedHtml}
              onHtmlChange={(newHtml) => {
                // Track edit history
                const timestamp = new Date().toLocaleTimeString('en-AU', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                setEditHistory(prev => [...prev, {
                  time: timestamp,
                  message: 'Resume content updated',
                  charCount: newHtml.length
                }]);
                setEditedHtml(newHtml);
              }}
            />
          )}
        </div>

        {/* Collapsible Right Sidebar */}
        {sidebarOpen && (
          <div className="w-96 border-l border-slate-700 bg-slate-900 overflow-y-auto flex-shrink-0">
            {/* Recruiter Message - Collapsible */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setRecruiterCollapsed(!recruiterCollapsed)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition"
              >
                <h3 className="text-lg font-semibold">Recruiter Message</h3>
                <span className="text-xl">
                  {recruiterCollapsed ? '▼' : '▲'}
                </span>
              </button>

              {!recruiterCollapsed && (
                <div className="p-4 pt-0">
                  <div className="mb-3">
                    <div className="text-xs text-slate-400 mb-2">
                      Subject: Application for Senior Data Analyst - Sydney
                    </div>
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      className="w-full h-64 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white text-sm resize-none"
                      placeholder="Edit the recruiter message..."
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      You can edit this message before copying it
                    </p>
                  </div>

                  <Button
                    onClick={handleCopyMessage}
                    size="sm"
                    variant="secondary"
                    icon="📋"
                    className="w-full"
                  >
                    Copy Message
                  </Button>
                </div>
              )}
            </div>

            {/* Generation Info - Collapsible */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setInfoCollapsed(!infoCollapsed)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition"
              >
                <h3 className="text-lg font-semibold">Generation Info</h3>
                <span className="text-xl">
                  {infoCollapsed ? '▼' : '▲'}
                </span>
              </button>

              {!infoCollapsed && (
                <div className="p-4 pt-0 space-y-3 text-sm">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Generated:</div>
                    <div className="text-white">
                      {new Date(generatedAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-xs mb-1">Output Directory:</div>
                    <div className="text-white font-mono text-xs break-all bg-slate-800 p-2 rounded">
                      {outputDirectory}
                    </div>
                  </div>

                  {usage && (
                    <>
                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <div className="text-slate-400 text-xs mb-2 font-semibold">API Usage:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-800 p-2 rounded">
                            <div className="text-slate-500">Input Tokens</div>
                            <div className="text-white font-mono">{usage.inputTokens.toLocaleString()}</div>
                          </div>
                          <div className="bg-slate-800 p-2 rounded">
                            <div className="text-slate-500">Output Tokens</div>
                            <div className="text-white font-mono">{usage.outputTokens.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mt-2 bg-slate-800 p-2 rounded">
                          <div className="text-slate-500 text-xs">Total Tokens</div>
                          <div className="text-white font-mono text-sm">{usage.totalTokens.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-3">
                        <div className="text-slate-400 text-xs mb-2 font-semibold">Cost:</div>
                        <div className="bg-emerald-900/30 border border-emerald-700 p-3 rounded">
                          <div className="text-emerald-400 text-2xl font-bold font-mono">
                            ${usage.costUSD.toFixed(4)}
                          </div>
                          <div className="text-emerald-300 text-xs mt-1">
                            Claude Sonnet 4.5 pricing
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Edit History - Collapsible */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setHistoryCollapsed(!historyCollapsed)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Edit History</h3>
                  {editHistory.length > 0 && (
                    <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {editHistory.length}
                    </span>
                  )}
                </div>
                <span className="text-xl">
                  {historyCollapsed ? '▼' : '▲'}
                </span>
              </button>

              {!historyCollapsed && (
                <div className="p-4 pt-0">
                  {editHistory.length === 0 ? (
                    <div className="text-slate-500 text-sm italic">
                      No edits yet. Switch to Edit mode to make changes.
                    </div>
                  ) : (
                    <div className="bg-black/40 rounded p-3 max-h-48 overflow-y-auto font-mono text-xs">
                      <div className="space-y-1">
                        {editHistory.map((edit, index) => (
                          <div key={index} className="text-purple-400">
                            <span className="text-slate-500">[{edit.time}]</span> {edit.message}
                            <span className="text-slate-600"> ({edit.charCount.toLocaleString()} chars)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Next Steps - Collapsible */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setStepsCollapsed(!stepsCollapsed)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition"
              >
                <h3 className="text-lg font-semibold text-blue-300">Next Steps</h3>
                <span className="text-xl">
                  {stepsCollapsed ? '▼' : '▲'}
                </span>
              </button>

              {!stepsCollapsed && (
                <div className="p-4 pt-0">
                  <ol className="text-sm text-blue-200/80 space-y-2 list-decimal list-inside">
                    <li>Review the tailored resume for accuracy</li>
                    <li>Save or export the resume to your desired format</li>
                    <li>Customize the recruiter message if needed</li>
                    <li>Apply for the job with your tailored resume!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewPage;
