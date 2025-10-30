/**
 * Message protocol types for webview <-> extension communication
 */

export type ExtensionMessage =
  | { command: 'initState'; data: any }
  | { command: 'progressUpdate'; stage: string; progress: number; message?: string }
  | { command: 'error'; message: string }
  | { command: 'success'; data: any }
  | { command: 'requirementsExtracted'; requirements: string; metadata: any }
  | { command: 'databaseLoaded'; database: any; stats: DatabaseStats }
  | { command: 'templateLoaded'; html: string; path: string }
  | { command: 'generationComplete'; html: string; message: string; generatedAt: string };

export type WebviewMessage =
  | { command: 'ready' }
  | { command: 'extractRequirements'; url: string }
  | { command: 'loadDatabase'; path?: string }
  | { command: 'loadTemplate'; path?: string }
  | { command: 'selectOutputDirectory' }
  | { command: 'generateResume' }
  | { command: 'saveResume'; format: 'html' | 'pdf'; filename?: string }
  | { command: 'openSettings' }
  | { command: 'updateAgentInstructions'; instructions: string }
  | { command: 'resetWorkflow' }
  | { command: 'configureAPI' };

export interface DatabaseStats {
  skillCount: number;
  technologyCount: number;
  achievementCount: number;
  companyCount: number;
  projectCount: number;
  roleCount: number;
}