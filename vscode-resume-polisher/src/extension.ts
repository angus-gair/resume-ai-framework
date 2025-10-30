/**
 * VSCode Resume Polisher Extension
 * Main entry point
 */

import * as vscode from 'vscode';
import { StateManager } from './services/stateManager';
import { DatabaseService } from './services/databaseService';
import { AIService } from './services/aiService';
import { ScrapingService } from './services/scrapingService';
import { FileService } from './services/fileService';
import { WebviewProvider } from './webview/webviewProvider';

let stateManager: StateManager;
let databaseService: DatabaseService;
let aiService: AIService;
let scrapingService: ScrapingService;
let fileService: FileService;
let webviewProvider: WebviewProvider;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('Resume Polisher extension is now active');

  // Initialize services
  stateManager = new StateManager(context);
  databaseService = new DatabaseService();
  aiService = new AIService(context);
  scrapingService = new ScrapingService();
  fileService = new FileService();

  // Initialize webview provider
  webviewProvider = new WebviewProvider(
    context.extensionUri,
    context,
    stateManager,
    databaseService,
    aiService,
    scrapingService,
    fileService
  );

  // Register webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WebviewProvider.viewType,
      webviewProvider
    )
  );

  // Register commands
  registerCommands(context);

  // Try to auto-detect and load database on activation
  await autoLoadDatabase();

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
  if (!hasShownWelcome) {
    const response = await vscode.window.showInformationMessage(
      'Welcome to Resume Polisher! Would you like to configure your Claude API key now?',
      'Configure',
      'Later'
    );

    if (response === 'Configure') {
      await vscode.commands.executeCommand('resumePolisher.configureAPI');
    }

    await context.globalState.update('hasShownWelcome', true);
  }
}

/**
 * Register all commands
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Main command - open Resume Polisher view
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.start', async () => {
      await vscode.commands.executeCommand('resumePolisher.view.focus');
      vscode.window.showInformationMessage('Resume Polisher started!');
    })
  );

  // Extract requirements from URL
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.extractFromUrl', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter job posting URL (e.g., from seek.com.au)',
        placeHolder: 'https://www.seek.com.au/job/...',
        validateInput: (value) => {
          if (!value) {
            return 'URL is required';
          }
          const validation = scrapingService.validateUrl(value);
          return validation.valid ? null : validation.error;
        }
      });

      if (!url) {
        return;
      }

      try {
        const pageContent = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Extracting job requirements...',
            cancellable: false
          },
          async () => {
            const content = await scrapingService.scrapeJobUrl(url);
            return content;
          }
        );

        const requirements = await aiService.extractRequirements(url, pageContent);

        const metadata = {
          jobUrl: url,
          extractedAt: new Date().toISOString()
        };

        await stateManager.setRequirements(requirements, metadata);

        vscode.window.showInformationMessage('Job requirements extracted successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to extract requirements: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Generate tailored resume
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.generateResume', async () => {
      const state = stateManager.getState();

      // Validate prerequisites
      if (!state.requirements) {
        vscode.window.showErrorMessage('No job requirements found. Please extract requirements first.');
        return;
      }
      if (!state.templateHtml) {
        vscode.window.showErrorMessage('No resume template loaded. Please select a template first.');
        return;
      }
      if (!state.database) {
        vscode.window.showErrorMessage('No resume database loaded. Please load database first.');
        return;
      }

      try {
        const result = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating tailored resume...',
            cancellable: false
          },
          async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing requirements...' });

            // TypeScript doesn't understand we validated above, so use non-null assertion
            const generated = await aiService.generateTailoredResume(
              state.requirements!,
              state.templateHtml!,
              state.database!
            );

            progress.report({ increment: 100, message: 'Complete!' });

            return generated;
          }
        );

        const generatedAt = new Date().toISOString();

        await stateManager.setResults(
          result.tailoredHtml,
          result.recruiterMessage,
          generatedAt
        );

        vscode.window.showInformationMessage('Resume generated successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to generate resume: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Open settings
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.openSettings', async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'resumePolisher');
    })
  );

  // Configure API key
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.configureAPI', async () => {
      const success = await aiService.updateAPIKey();
      if (success) {
        await stateManager.setAPIInitialized(true);
        vscode.window.showInformationMessage('Claude API key configured successfully!');
      }
    })
  );

  // Export to PDF
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.exportPDF', async () => {
      const state = stateManager.getState();

      if (!state.tailoredHtml) {
        vscode.window.showErrorMessage('No generated resume found. Please generate a resume first.');
        return;
      }

      const defaultFilename = `resume-${new Date().toISOString().split('T')[0]}.pdf`;

      const savePath = await fileService.showSaveDialog(defaultFilename, {
        'PDF Files': ['pdf']
      });

      if (!savePath) {
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Exporting to PDF...',
            cancellable: false
          },
          async () => {
            await fileService.exportToPdf(state.tailoredHtml!, savePath);
          }
        );

        vscode.window.showInformationMessage(`Resume exported: ${savePath}`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Reset workflow
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.reset', async () => {
      const response = await vscode.window.showWarningMessage(
        'Are you sure you want to reset the workflow? This will clear all current job data.',
        'Reset',
        'Cancel'
      );

      if (response === 'Reset') {
        await stateManager.resetForNewJob();
        vscode.window.showInformationMessage('Workflow reset successfully!');
      }
    })
  );

  // Load database manually
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.loadDatabase', async () => {
      const selected = await fileService.showFolderDialog();

      if (!selected) {
        return;
      }

      try {
        const { database, stats } = await databaseService.loadDatabase(selected);

        await stateManager.setDatabase(selected, database);

        vscode.window.showInformationMessage(
          `Database loaded: ${stats.achievementCount} achievements, ${stats.skillCount} skills`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to load database: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );

  // Load template manually
  context.subscriptions.push(
    vscode.commands.registerCommand('resumePolisher.loadTemplate', async () => {
      const selected = await fileService.showOpenDialog({
        'HTML Files': ['html']
      });

      if (!selected) {
        return;
      }

      try {
        const html = await fileService.readHtmlFile(selected);

        await stateManager.setTemplate(selected, html);

        vscode.window.showInformationMessage('Resume template loaded successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to load template: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })
  );
}

/**
 * Auto-load database on activation
 */
async function autoLoadDatabase() {
  try {
    const databasePath = await databaseService.findDatabaseInWorkspace();

    if (databasePath) {
      const { database, stats } = await databaseService.loadDatabase(databasePath);

      await stateManager.setDatabase(databasePath, database);

      console.log(
        `Auto-loaded resume database: ${stats.achievementCount} achievements, ${stats.skillCount} skills`
      );
    }
  } catch (error) {
    // Silent fail - user can manually load database later
    console.warn('Could not auto-load database:', error);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('Resume Polisher extension deactivated');
}