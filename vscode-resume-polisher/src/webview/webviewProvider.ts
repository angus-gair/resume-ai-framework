/**
 * Webview provider for Resume Polisher UI
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { WebviewMessage, ExtensionMessage, DatabaseStats } from '../types/messages';
import { StateManager } from '../services/stateManager';
import { DatabaseService } from '../services/databaseService';
import { AIService } from '../services/aiService';
import { ScrapingService } from '../services/scrapingService';
import { FileService } from '../services/fileService';

export class WebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'resumePolisher.view';
  
  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private readonly context: vscode.ExtensionContext;
  private readonly stateManager: StateManager;
  private readonly databaseService: DatabaseService;
  private readonly aiService: AIService;
  private readonly scrapingService: ScrapingService;
  private readonly fileService: FileService;

  constructor(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    stateManager: StateManager,
    databaseService: DatabaseService,
    aiService: AIService,
    scrapingService: ScrapingService,
    fileService: FileService
  ) {
    this._extensionUri = extensionUri;
    this.context = context;
    this.stateManager = stateManager;
    this.databaseService = databaseService;
    this.aiService = aiService;
    this.scrapingService = scrapingService;
    this.fileService = fileService;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.handleMessage(message);
    });

    // Send initial state when webview becomes visible
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.sendInitialState();
      }
    });

    // Send initial state immediately
    this.sendInitialState();
  }

  /**
   * Handle messages from webview
   */
  private async handleMessage(message: WebviewMessage): Promise<void> {
    try {
      switch (message.command) {
        case 'ready':
          this.sendInitialState();
          break;

        case 'extractRequirements':
          await this.handleExtractRequirements(message.url);
          break;

        case 'loadDatabase':
          await this.handleLoadDatabase(message.path);
          break;

        case 'loadTemplate':
          await this.handleLoadTemplate(message.path);
          break;

        case 'selectOutputDirectory':
          await this.handleSelectOutputDirectory();
          break;

        case 'generateResume':
          await this.handleGenerateResume();
          break;

        case 'saveResume':
          await this.handleSaveResume(message.format, message.filename);
          break;

        case 'openSettings':
          await this.handleOpenSettings();
          break;

        case 'updateAgentInstructions':
          await this.handleUpdateAgentInstructions(message.instructions);
          break;

        case 'resetWorkflow':
          await this.handleResetWorkflow();
          break;

        case 'configureAPI':
          await this.handleConfigureAPI();
          break;

        default:
          console.warn('Unknown command:', message);
      }
    } catch (error) {
      this.sendError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send initial state to webview
   */
  private sendInitialState(): void {
    const state = this.stateManager.getState();
    this.sendMessage({
      command: 'initState',
      data: state
    });
  }

  /**
   * Handle extract requirements
   */
  private async handleExtractRequirements(url: string): Promise<void> {
    try {
      // Validate URL
      const validation = this.scrapingService.validateUrl(url);
      if (!validation.valid) {
        this.sendError(validation.error || 'Invalid URL');
        return;
      }

      // Scrape page content
      const pageContent = await this.scrapingService.scrapeJobUrl(url);

      // Extract requirements using AI
      const requirements = await this.aiService.extractRequirements(url, pageContent);

      // Save to state
      const metadata = {
        jobUrl: url,
        extractedAt: new Date().toISOString()
      };

      await this.stateManager.setRequirements(requirements, metadata);

      // Send to webview
      this.sendMessage({
        command: 'requirementsExtracted',
        requirements,
        metadata
      });

      vscode.window.showInformationMessage('Job requirements extracted successfully!');
    } catch (error) {
      this.sendError(`Failed to extract requirements: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle load database
   */
  private async handleLoadDatabase(providedPath?: string): Promise<void> {
    try {
      let databasePath = providedPath;

      if (!databasePath) {
        // Try auto-detection first
        const detected = await this.databaseService.findDatabaseInWorkspace();

        if (!detected) {
          // Show folder picker
          const selected = await this.fileService.showFolderDialog();
          if (!selected) {
            return;
          }
          databasePath = selected;
        } else {
          databasePath = detected;
        }
      }

      // At this point databasePath is guaranteed to be a string
      if (!databasePath) {
        return;
      }

      // Load database
      const { database, stats } = await this.databaseService.loadDatabase(databasePath);

      // Save to state
      await this.stateManager.setDatabase(databasePath, database);

      // Send to webview
      this.sendMessage({
        command: 'databaseLoaded',
        database,
        stats
      });

      vscode.window.showInformationMessage(
        `Database loaded: ${stats.achievementCount} achievements, ${stats.skillCount} skills`
      );
    } catch (error) {
      this.sendError(`Failed to load database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle load template
   */
  private async handleLoadTemplate(providedPath?: string): Promise<void> {
    try {
      let templatePath = providedPath;

      if (!templatePath) {
        // Show file picker
        templatePath = await this.fileService.showOpenDialog({
          'HTML Files': ['html']
        });

        if (!templatePath) {
          return;
        }
      }

      // Read template
      const html = await this.fileService.readHtmlFile(templatePath);

      // Save to state
      await this.stateManager.setTemplate(templatePath, html);

      // Send to webview
      this.sendMessage({
        command: 'templateLoaded',
        html,
        path: templatePath
      });

      vscode.window.showInformationMessage('Resume template loaded successfully!');
    } catch (error) {
      this.sendError(`Failed to load template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle select output directory
   */
  private async handleSelectOutputDirectory(): Promise<void> {
    try {
      const selected = await this.fileService.showFolderDialog();
      
      if (selected) {
        await this.stateManager.setOutputDirectory(selected);
        vscode.window.showInformationMessage(`Output directory set: ${selected}`);
      }
    } catch (error) {
      this.sendError(`Failed to select directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle generate resume
   */
  private async handleGenerateResume(): Promise<void> {
    try {
      const state = this.stateManager.getState();

      // Validate prerequisites
      if (!state.requirements) {
        throw new Error('No job requirements found. Please extract requirements first.');
      }
      if (!state.templateHtml) {
        throw new Error('No resume template loaded. Please select a template first.');
      }
      if (!state.database) {
        throw new Error('No resume database loaded. Please load database first.');
      }
      if (!state.outputDirectory) {
        throw new Error('No output directory selected. Please select an output directory first.');
      }

      // Generate resume
      await this.stateManager.setGenerationState(true, 0, 'starting');

      const result = await this.aiService.generateTailoredResume(
        state.requirements,
        state.templateHtml,
        state.database
      );

      const generatedAt = new Date().toISOString();

      // Save results
      await this.stateManager.setResults(
        result.tailoredHtml,
        result.recruiterMessage,
        generatedAt
      );

      await this.stateManager.setGenerationState(false, 100, 'complete');

      // Send to webview
      this.sendMessage({
        command: 'generationComplete',
        html: result.tailoredHtml,
        message: result.recruiterMessage,
        generatedAt
      });

      vscode.window.showInformationMessage('Resume generated successfully!');
    } catch (error) {
      await this.stateManager.setGenerationState(false, 0, '');
      this.sendError(`Failed to generate resume: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle save resume
   */
  private async handleSaveResume(format: 'html' | 'pdf', filename?: string): Promise<void> {
    try {
      const state = this.stateManager.getState();

      if (!state.tailoredHtml) {
        throw new Error('No generated resume found. Please generate a resume first.');
      }

      const defaultFilename = filename || `resume-${new Date().toISOString().split('T')[0]}`;
      const extension = format === 'pdf' ? 'pdf' : 'html';

      const savePath = await this.fileService.showSaveDialog(
        `${defaultFilename}.${extension}`,
        format === 'pdf' 
          ? { 'PDF Files': ['pdf'] }
          : { 'HTML Files': ['html'] }
      );

      if (!savePath) {
        return;
      }

      if (format === 'pdf') {
        await this.fileService.exportToPdf(state.tailoredHtml, savePath);
      } else {
        await this.fileService.writeHtmlFile(savePath, state.tailoredHtml);
      }

      vscode.window.showInformationMessage(`Resume saved: ${savePath}`);
    } catch (error) {
      this.sendError(`Failed to save resume: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle open settings
   */
  private async handleOpenSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'resumePolisher');
  }

  /**
   * Handle update agent instructions
   */
  private async handleUpdateAgentInstructions(instructions: string): Promise<void> {
    try {
      await this.stateManager.setCustomAgentInstructions(instructions);
      
      const config = vscode.workspace.getConfiguration('resumePolisher');
      await config.update('agentInstructions', instructions, vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage('Agent instructions updated successfully!');
    } catch (error) {
      this.sendError(`Failed to update instructions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle reset workflow
   */
  private async handleResetWorkflow(): Promise<void> {
    try {
      await this.stateManager.resetForNewJob();
      this.sendInitialState();
      vscode.window.showInformationMessage('Workflow reset successfully!');
    } catch (error) {
      this.sendError(`Failed to reset workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle configure API
   */
  private async handleConfigureAPI(): Promise<void> {
    try {
      const success = await this.aiService.updateAPIKey();
      if (success) {
        await this.stateManager.setAPIInitialized(true);
        this.sendInitialState();
      }
    } catch (error) {
      this.sendError(`Failed to configure API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send message to webview
   */
  private sendMessage(message: ExtensionMessage): void {
    this._view?.webview.postMessage(message);
  }

  /**
   * Send progress update
   */
  public sendProgress(stage: string, progress: number, message?: string): void {
    this.sendMessage({
      command: 'progressUpdate',
      stage,
      progress,
      message
    });
  }

  /**
   * Send error message
   */
  private sendError(message: string): void {
    this.sendMessage({
      command: 'error',
      message
    });
    vscode.window.showErrorMessage(message);
  }

  /**
   * Get HTML for webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get path to bundled webview script
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist', 'index.js')
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist', 'index.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
      <link href="${styleUri}" rel="stylesheet">
      <title>Resume Polisher</title>
    </head>
    <body>
      <div id="root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}