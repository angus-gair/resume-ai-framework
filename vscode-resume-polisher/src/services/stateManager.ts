/**
 * State management service with persistence
 */

import * as vscode from 'vscode';
import { ExtensionState } from '../types/state';

export class StateManager {
  private state: ExtensionState;
  private readonly memento: vscode.Memento;

  constructor(context: vscode.ExtensionContext) {
    this.memento = context.workspaceState;
    
    // Initialize state from memento or defaults
    this.state = this.loadState();
  }

  private loadState(): ExtensionState {
    const saved = this.memento.get<Partial<ExtensionState>>('resumePolisherState', {});
    
    return {
      // API Configuration
      isAPIInitialized: saved.isAPIInitialized ?? false,

      // Stage 1: Requirements
      jobUrl: saved.jobUrl ?? '',
      requirements: saved.requirements ?? '',
      requirementsMetadata: saved.requirementsMetadata ?? null,

      // Stage 2: Configuration
      templatePath: saved.templatePath ?? '',
      templateHtml: saved.templateHtml ?? '',
      databasePath: saved.databasePath ?? '',
      database: saved.database ?? null,
      outputDirectory: saved.outputDirectory ?? '',

      // Stage 3: Generation
      isGenerating: false, // Always reset to false on load
      generationProgress: 0,
      generationStage: '',

      // Stage 4: Results
      tailoredHtml: saved.tailoredHtml ?? '',
      recruiterMessage: saved.recruiterMessage ?? '',
      generatedAt: saved.generatedAt ?? null,

      // Settings
      customAgentInstructions: saved.customAgentInstructions ?? ''
    };
  }

  async saveState(): Promise<void> {
    await this.memento.update('resumePolisherState', this.state);
  }

  getState(): ExtensionState {
    return { ...this.state };
  }

  async updateState(updates: Partial<ExtensionState>): Promise<void> {
    this.state = { ...this.state, ...updates };
    await this.saveState();
  }

  async setAPIInitialized(value: boolean): Promise<void> {
    await this.updateState({ isAPIInitialized: value });
  }

  async setRequirements(requirements: string, metadata: any): Promise<void> {
    await this.updateState({
      requirements,
      requirementsMetadata: metadata
    });
  }

  async setTemplate(path: string, html: string): Promise<void> {
    await this.updateState({
      templatePath: path,
      templateHtml: html
    });
  }

  async setDatabase(path: string, database: any): Promise<void> {
    await this.updateState({
      databasePath: path,
      database
    });
  }

  async setOutputDirectory(dir: string): Promise<void> {
    await this.updateState({ outputDirectory: dir });
  }

  async setGenerationState(isGenerating: boolean, progress: number, stage: string): Promise<void> {
    await this.updateState({
      isGenerating,
      generationProgress: progress,
      generationStage: stage
    });
  }

  async setResults(tailoredHtml: string, recruiterMessage: string, generatedAt: string): Promise<void> {
    await this.updateState({
      tailoredHtml,
      recruiterMessage,
      generatedAt
    });
  }

  async setCustomAgentInstructions(instructions: string): Promise<void> {
    await this.updateState({ customAgentInstructions: instructions });
  }

  async resetForNewJob(): Promise<void> {
    await this.updateState({
      jobUrl: '',
      requirements: '',
      requirementsMetadata: null,
      tailoredHtml: '',
      recruiterMessage: '',
      generatedAt: null,
      generationProgress: 0,
      generationStage: '',
      isGenerating: false
    });
  }

  async clearAll(): Promise<void> {
    await this.memento.update('resumePolisherState', undefined);
    this.state = this.loadState();
  }

  canProceedToGenerate(): boolean {
    return !!(
      this.state.requirements &&
      this.state.templateHtml &&
      this.state.database &&
      this.state.outputDirectory
    );
  }
}