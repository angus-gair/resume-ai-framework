const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API initialization
  initializeAPI: (apiKey) => ipcRenderer.invoke('initialize-api', apiKey),

  // File system
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readYAML: (filePath) => ipcRenderer.invoke('read-yaml', filePath),
  readJSON: (filePath) => ipcRenderer.invoke('read-json', filePath),
  checkPathExists: (filePath) => ipcRenderer.invoke('check-path-exists', filePath),

  // Stage 1: Extract Requirements
  scrapeJobUrl: (jobUrl) => ipcRenderer.invoke('scrape-job-url', jobUrl),
  extractRequirements: (data) => ipcRenderer.invoke('extract-requirements', data),

  // Stage 2: Database
  loadDatabase: (databasePath) => ipcRenderer.invoke('load-database', databasePath),

  // Stage 3: Generate
  generateTailoredResume: (data) => ipcRenderer.invoke('generate-tailored-resume', data),

  // Stage 4: Export
  saveResume: (data) => ipcRenderer.invoke('save-resume', data),
  exportPDF: (data) => ipcRenderer.invoke('export-pdf', data),

  // Utility
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Event listeners for progress updates
  onScrapingProgress: (callback) => {
    ipcRenderer.on('scraping-progress', (event, data) => callback(data));
  },
  onExtractionProgress: (callback) => {
    ipcRenderer.on('extraction-progress', (event, data) => callback(data));
  },
  onDatabaseLoading: (callback) => {
    ipcRenderer.on('database-loading', (event, data) => callback(data));
  },
  onGenerationProgress: (callback) => {
    ipcRenderer.on('generation-progress', (event, data) => callback(data));
  },

  // Remove listeners
  removeScrapingProgressListener: () => {
    ipcRenderer.removeAllListeners('scraping-progress');
  },
  removeExtractionProgressListener: () => {
    ipcRenderer.removeAllListeners('extraction-progress');
  },
  removeDatabaseLoadingListener: () => {
    ipcRenderer.removeAllListeners('database-loading');
  },
  removeGenerationProgressListener: () => {
    ipcRenderer.removeAllListeners('generation-progress');
  }
});
