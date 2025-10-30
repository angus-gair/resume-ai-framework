/**
 * Extension state interfaces
 */

export interface ResumeDatabase {
  masterResume: any;
  index: DatabaseIndex;
  evidenceMap?: any;
  path: string;
}

export interface DatabaseIndex {
  indices: {
    skills: {
      primary: string[];
      secondary: string[];
    };
    technologies: string[];
    domains: string[];
    companies: string[];
  };
  lookup_tables: {
    role_by_company: Record<string, string[]>;
    role_by_skill: Record<string, string[]>;
    project_by_domain: Record<string, string[]>;
    [key: string]: Record<string, string[]>;
  };
  query_paths: {
    get_top_achievements_by_impact: string[];
    get_roles_by_timeframe: Record<string, string[]>;
    [key: string]: any;
  };
}

export interface ExtensionState {
  // API Configuration
  isAPIInitialized: boolean;

  // Stage 1: Requirements
  jobUrl: string;
  requirements: string;
  requirementsMetadata: {
    extractedAt: string;
    jobUrl: string;
  } | null;

  // Stage 2: Configuration
  templatePath: string;
  templateHtml: string;
  databasePath: string;
  database: ResumeDatabase | null;
  outputDirectory: string;

  // Stage 3: Generation
  isGenerating: boolean;
  generationProgress: number;
  generationStage: string;

  // Stage 4: Results
  tailoredHtml: string;
  recruiterMessage: string;
  generatedAt: string | null;

  // Settings
  customAgentInstructions: string;
}

export interface ProgressUpdate {
  stage: string;
  progress: number;
  message?: string;
}

export interface GenerationResult {
  success: boolean;
  tailoredHtml?: string;
  recruiterMessage?: string;
  generatedAt?: string;
  error?: string;
}