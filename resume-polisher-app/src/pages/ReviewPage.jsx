import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';

function ReviewPage() {
  const {
    tailoredHtml,
    recruiterMessage,
    generatedAt,
    outputDirectory,
    resetForNewJob,
  } = useStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [editedMessage, setEditedMessage] = useState(recruiterMessage);

  const handleSaveHTML = async () => {
    setIsSaving(true);
    setSaveStatus('');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume-tailored-${timestamp}.html`;
      const outputPath = `${outputDirectory}/${filename}`;

      const result = await window.electronAPI.saveResume({
        html: tailoredHtml,
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
        html: tailoredHtml,
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Review & Export</h2>
        <p className="text-gray-400">
          Review your tailored resume and export it
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Resume Preview */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tailored Resume</h3>
            <div className="flex gap-2">
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
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <iframe
              srcDoc={tailoredHtml}
              className="w-full h-full min-h-[600px]"
              title="Resume Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Recruiter Message */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recruiter Message</h3>
              <Button
                onClick={handleCopyMessage}
                size="sm"
                variant="secondary"
                icon="📋"
              >
                Copy
              </Button>
            </div>

            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full h-48 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-white resize-none"
              placeholder="Edit the recruiter message..."
            />

            <p className="text-xs text-gray-500 mt-2">
              You can edit this message before copying it
            </p>
          </div>

          {/* Metadata */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Generation Info</h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Generated:</span>
                <div className="text-white mt-1">
                  {new Date(generatedAt).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-gray-400">Output Directory:</span>
                <div className="text-white mt-1 font-mono text-xs break-all">
                  {outputDirectory}
                </div>
              </div>

              {saveStatus && (
                <div className={`p-3 rounded ${
                  saveStatus.startsWith('✓')
                    ? 'bg-green-900/30 border border-green-700 text-green-300'
                    : 'bg-red-900/30 border border-red-700 text-red-300'
                }`}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-300">Next Steps</h4>
            <ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
              <li>Review the tailored resume for accuracy</li>
              <li>Save or export the resume to your desired format</li>
              <li>Customize the recruiter message if needed</li>
              <li>Apply for the job with your tailored resume!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between">
        <Button
          onClick={resetForNewJob}
          variant="secondary"
          icon="🔄"
        >
          Start New Job Application
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={async () => {
              await handleSaveHTML();
              await handleExportPDF();
            }}
            loading={isSaving || isExportingPDF}
            icon="💾"
          >
            Save Both (HTML + PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;
