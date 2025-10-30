import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';

function ConfigurePage() {
  const {
    templatePath,
    setTemplatePath,
    setTemplateHtml,
    databasePath,
    setDatabasePath,
    database,
    setDatabase,
    outputDirectory,
    setOutputDirectory,
    setCurrentPage,
    databaseLoadingProgress,
    setDatabaseLoadingProgress,
  } = useStore();

  const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.electronAPI.onDatabaseLoading(setDatabaseLoadingProgress);
    return () => {
      window.electronAPI.removeDatabaseLoadingListener();
    };
  }, []);

  const handleSelectTemplate = async () => {
    const result = await window.electronAPI.selectFile([
      { name: 'HTML Files', extensions: ['html'] },
    ]);

    if (result.success) {
      setTemplatePath(result.path);

      // Read the HTML file
      const fileResult = await window.electronAPI.readFile(result.path);
      if (fileResult.success) {
        setTemplateHtml(fileResult.content);
      }
    }
  };

  const handleSelectDatabase = async () => {
    const result = await window.electronAPI.selectDirectory();

    if (result.success) {
      setIsLoadingDatabase(true);
      setError('');

      try {
        const dbResult = await window.electronAPI.loadDatabase(result.path);

        if (dbResult.success) {
          setDatabasePath(result.path);
          setDatabase(dbResult.database);
        } else {
          setError(`Failed to load database: ${dbResult.error}`);
        }
      } catch (err) {
        setError(`Error loading database: ${err.message}`);
      } finally {
        setIsLoadingDatabase(false);
      }
    }
  };

  const handleSelectOutput = async () => {
    const result = await window.electronAPI.selectDirectory();
    if (result.success) {
      setOutputDirectory(result.path);
    }
  };

  const canProceed = templatePath && database && outputDirectory;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Configure Settings</h2>
        <p className="text-gray-400">
          Select your resume template, database, and output location
        </p>
      </div>

      <div className="space-y-6">
        {/* Template Selection */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Resume Template</h3>
              <p className="text-sm text-gray-400 mb-4">
                Select an HTML resume template to use as the base
              </p>
            </div>
            <Button onClick={handleSelectTemplate} icon="📄" variant="secondary">
              Select Template
            </Button>
          </div>

          {templatePath && (
            <div className="bg-slate-900 px-4 py-3 rounded border border-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <code className="text-sm text-gray-300">{templatePath}</code>
              </div>
            </div>
          )}
        </div>

        {/* Database Selection */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Resume Database</h3>
              <p className="text-sm text-gray-400 mb-4">
                Select the curator-output-master-reume directory
              </p>
            </div>
            <Button
              onClick={handleSelectDatabase}
              icon="🗄️"
              variant="secondary"
              loading={isLoadingDatabase}
            >
              Select Database
            </Button>
          </div>

          {isLoadingDatabase && (
            <ProgressBar
              progress={databaseLoadingProgress.progress || 0}
              stage={databaseLoadingProgress.stage}
              label="Loading database"
            />
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {database && (
            <div className="space-y-3">
              <div className="bg-slate-900 px-4 py-3 rounded border border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-green-500">✓</span>
                  <code className="text-sm text-gray-300">{databasePath}</code>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-2xl font-bold text-primary-400">
                      {database.index.indices.skills.primary.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Primary Skills</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-2xl font-bold text-primary-400">
                      {database.index.indices.technologies.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Technologies</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-2xl font-bold text-primary-400">
                      {database.index.query_paths.get_top_achievements_by_impact.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Achievements</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-2xl font-bold text-primary-400">
                      {Object.keys(database.index.lookup_tables.role_by_company).length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Companies</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Directory Selection */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Output Directory</h3>
              <p className="text-sm text-gray-400 mb-4">
                Where to save the generated resume
              </p>
            </div>
            <Button onClick={handleSelectOutput} icon="📁" variant="secondary">
              Select Directory
            </Button>
          </div>

          {outputDirectory && (
            <div className="bg-slate-900 px-4 py-3 rounded border border-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <code className="text-sm text-gray-300">{outputDirectory}</code>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => setCurrentPage('extract')}
            variant="ghost"
          >
            ← Back
          </Button>

          <Button
            onClick={() => setCurrentPage('generate')}
            disabled={!canProceed}
            icon="→"
          >
            Continue to Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfigurePage;
