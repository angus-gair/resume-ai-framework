/**
 * File service for HTML/PDF operations
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { chromium, Browser } from 'playwright';

export class FileService {
  /**
   * Read HTML file
   */
  async readHtmlFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read HTML file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Write HTML file
   */
  async writeHtmlFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write HTML file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export HTML to PDF
   */
  async exportToPdf(html: string, outputPath: string): Promise<void> {
    let browser: Browser | undefined;

    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Set content
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      await browser.close();
    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }

      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Show save file dialog
   */
  async showSaveDialog(
    defaultFilename: string,
    filters: { [name: string]: string[] }
  ): Promise<string | undefined> {
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(path.join(this.getDefaultOutputDir(), defaultFilename)),
      filters
    });

    return uri?.fsPath;
  }

  /**
   * Show open file dialog
   */
  async showOpenDialog(filters: { [name: string]: string[] }): Promise<string | undefined> {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters
    });

    return uris && uris.length > 0 ? uris[0].fsPath : undefined;
  }

  /**
   * Show folder picker dialog
   */
  async showFolderDialog(): Promise<string | undefined> {
    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    });

    return uris && uris.length > 0 ? uris[0].fsPath : undefined;
  }

  /**
   * Get default output directory
   */
  private getDefaultOutputDir(): string {
    const config = vscode.workspace.getConfiguration('resumePolisher');
    const configuredDir = config.get<string>('outputDirectory');

    if (configuredDir) {
      return this.resolvePath(configuredDir);
    }

    // Default to workspace folder + /polished-resume
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return path.join(workspaceFolders[0].uri.fsPath, 'polished-resume');
    }

    // Fallback to user's home directory
    return path.join(process.env.HOME || process.env.USERPROFILE || '', 'polished-resume');
  }

  /**
   * Resolve path with workspace variable substitution
   */
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return filePath;
    }

    // Replace ${workspaceFolder} variable
    let resolved = filePath.replace(/\$\{workspaceFolder\}/g, workspaceFolders[0].uri.fsPath);

    // If still relative, resolve from workspace root
    if (!path.isAbsolute(resolved)) {
      resolved = path.join(workspaceFolders[0].uri.fsPath, resolved);
    }

    return resolved;
  }

  /**
   * Generate timestamped filename
   */
  generateFilename(jobTitle: string, company: string, extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    const sanitizedTitle = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sanitizedCompany = company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return `${sanitizedTitle}-${sanitizedCompany}-${date}.${extension}`;
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Copy file
   */
  async copyFile(source: string, destination: string): Promise<void> {
    try {
      const dir = path.dirname(destination);
      await fs.mkdir(dir, { recursive: true });
      await fs.copyFile(source, destination);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}