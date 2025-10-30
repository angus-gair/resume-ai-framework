import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // API state
  isAPIInitialized: false,
  apiKey: '',
  provider: 'anthropic', // 'anthropic', 'openai', 'openrouter'
  model: 'claude-sonnet-4-5',
  baseURL: '',

  // Navigation
  currentPage: 'extract',

  // Stage 1: Requirements
  jobUrl: '',
  requirements: '',
  requirementsMetadata: null,

  // Stage 2: Configuration
  templatePath: '',
  templateHtml: '',
  databasePath: '',
  database: null,
  outputDirectory: '',

  // Stage 3: Generation
  isGenerating: false,
  generationProgress: 0,
  generationStage: '',

  // Stage 4: Results
  tailoredHtml: '',
  recruiterMessage: '',
  generatedAt: null,
  usage: null,

  // Progress tracking
  scrapingProgress: {},
  extractionProgress: {},
  databaseLoadingProgress: {},

  // Actions
  setAPIInitialized: (value) => set({ isAPIInitialized: value }),
  setAPIKey: (key) => set({ apiKey: key }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setBaseURL: (baseURL) => set({ baseURL }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setJobUrl: (url) => set({ jobUrl: url }),
  setRequirements: (requirements, metadata) =>
    set({ requirements, requirementsMetadata: metadata }),

  setTemplatePath: (path) => set({ templatePath: path }),
  setTemplateHtml: (html) => set({ templateHtml: html }),
  setDatabasePath: (path) => set({ databasePath: path }),
  setDatabase: (database) => set({ database }),
  setOutputDirectory: (dir) => set({ outputDirectory: dir }),

  setGenerationState: (isGenerating, progress, stage) =>
    set({ isGenerating, generationProgress: progress, generationStage: stage }),

  setResults: (tailoredHtml, recruiterMessage, generatedAt, usage) =>
    set({ tailoredHtml, recruiterMessage, generatedAt, usage }),

  setScrapingProgress: (progress) => set({ scrapingProgress: progress }),
  setExtractionProgress: (progress) => set({ extractionProgress: progress }),
  setDatabaseLoadingProgress: (progress) => set({ databaseLoadingProgress: progress }),

  // Reset for new job
  resetForNewJob: () => set({
    currentPage: 'extract',
    jobUrl: '',
    requirements: '',
    requirementsMetadata: null,
    tailoredHtml: '',
    recruiterMessage: '',
    generatedAt: null,
    usage: null,
    generationProgress: 0,
    generationStage: '',
  }),

  // Check if ready to proceed
  canProceedToGenerate: () => {
    const state = get();
    return !!(
      state.requirements &&
      state.templateHtml &&
      state.database &&
      state.outputDirectory
    );
  }
}));
