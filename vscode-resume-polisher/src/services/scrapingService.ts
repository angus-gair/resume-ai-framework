/**
 * Web scraping service for extracting job posting content
 */

import * as vscode from 'vscode';
import { chromium, Browser, Page } from 'playwright';

export class ScrapingService {
  private readonly progressCallback?: (stage: string, progress: number, message?: string) => void;

  constructor(progressCallback?: (stage: string, progress: number, message?: string) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * Scrape job posting from URL
   */
  async scrapeJobUrl(jobUrl: string): Promise<string> {
    let browser: Browser | undefined;

    try {
      this.progressCallback?.('launching', 10, 'Launching browser...');

      // Launch headless browser
      browser = await chromium.launch({ 
        headless: true,
        timeout: 30000
      });

      const page = await browser.newPage();

      this.progressCallback?.('navigating', 30, 'Loading job posting...');

      // Navigate to URL
      await page.goto(jobUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000
      });

      this.progressCallback?.('extracting', 50, 'Extracting content...');

      // Extract text content
      const pageContent = await page.evaluate(() => {
        // Remove scripts, styles, navigation, headers, footers
        const clone = document.cloneNode(true) as Document;
        clone.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .sidebar').forEach(el => el.remove());
        
        // Get main content or body text
        const main = clone.querySelector('main') || clone.querySelector('article') || clone.body;
        return main ? main.innerText : document.body.innerText;
      });

      await browser.close();

      this.progressCallback?.('complete', 100, 'Extraction complete');

      return pageContent;
    } catch (error) {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          // Ignore close errors
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide helpful error messages
      if (errorMessage.includes('timeout')) {
        throw new Error('Failed to load job posting: Page took too long to load. Please check the URL and try again.');
      } else if (errorMessage.includes('net::ERR')) {
        throw new Error('Failed to load job posting: Network error. Please check your internet connection and the URL.');
      } else {
        throw new Error(`Failed to scrape job posting: ${errorMessage}`);
      }
    }
  }

  /**
   * Validate URL before scraping
   */
  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { 
          valid: false, 
          error: 'URL must use HTTP or HTTPS protocol' 
        };
      }

      // Check for common job board domains (optional, for better UX)
      const jobBoardDomains = [
        'seek.com.au',
        'linkedin.com',
        'indeed.com',
        'glassdoor.com',
        'monster.com',
        'careers'
      ];

      const isJobBoard = jobBoardDomains.some(domain => 
        parsedUrl.hostname.includes(domain)
      );

      if (!isJobBoard) {
        vscode.window.showWarningMessage(
          'URL does not appear to be from a recognized job board. Continue anyway?',
          'Yes', 'No'
        ).then(response => {
          if (response !== 'Yes') {
            return { valid: false, error: 'User cancelled' };
          }
        });
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Invalid URL format. Please enter a valid HTTP/HTTPS URL.' 
      };
    }
  }

  /**
   * Quick test to check if Playwright is installed
   */
  async testPlaywright(): Promise<boolean> {
    try {
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        'Playwright browser not installed. Would you like to install it now?',
        'Install', 'Cancel'
      ).then(async (response) => {
        if (response === 'Install') {
          const terminal = vscode.window.createTerminal('Install Playwright');
          terminal.show();
          terminal.sendText('npx playwright install chromium');
        }
      });
      return false;
    }
  }
}