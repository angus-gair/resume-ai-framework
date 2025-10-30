/**
 * Database service for loading and querying resume database
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { ResumeDatabase, DatabaseIndex } from '../types/state';
import { DatabaseStats } from '../types/messages';

export class DatabaseService {
  private database: ResumeDatabase | null = null;

  /**
   * Auto-detect database in workspace
   */
  async findDatabaseInWorkspace(): Promise<string | null> {
    const files = await vscode.workspace.findFiles(
      '**/curator-output-master-reume/master_resume.yaml',
      '**/node_modules/**',
      1
    );

    if (files.length > 0) {
      return path.dirname(files[0].fsPath);
    }

    // Also check configured path
    const config = vscode.workspace.getConfiguration('resumePolisher');
    const configuredPath = config.get<string>('databasePath');
    
    if (configuredPath) {
      const resolvedPath = this.resolvePath(configuredPath);
      const exists = await this.checkPathExists(path.join(resolvedPath, 'master_resume.yaml'));
      if (exists) {
        return resolvedPath;
      }
    }

    return null;
  }

  /**
   * Load database from directory
   */
  async loadDatabase(databasePath: string): Promise<{ database: ResumeDatabase; stats: DatabaseStats }> {
    try {
      // Load master_resume.yaml
      const yamlPath = path.join(databasePath, 'master_resume.yaml');
      const yamlContent = await fs.readFile(yamlPath, 'utf-8');
      const masterResume = yaml.load(yamlContent);

      // Load master_resume.index.json
      const indexPath = path.join(databasePath, 'master_resume.index.json');
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const index: DatabaseIndex = JSON.parse(indexContent);

      // Load evidence_map.json (optional)
      let evidenceMap = null;
      try {
        const evidencePath = path.join(databasePath, 'evidence_map.json');
        const evidenceContent = await fs.readFile(evidencePath, 'utf-8');
        evidenceMap = JSON.parse(evidenceContent);
      } catch (e) {
        // Evidence map is optional
      }

      this.database = {
        masterResume,
        index,
        evidenceMap,
        path: databasePath
      };

      // Calculate stats
      const stats = this.calculateStats(index, masterResume);

      return { database: this.database, stats };
    } catch (error) {
      throw new Error(`Failed to load database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate database statistics
   */
  private calculateStats(index: DatabaseIndex, masterResume: any): DatabaseStats {
    const skillCount = index.indices.skills.primary.length + index.indices.skills.secondary.length;
    const technologyCount = index.indices.technologies.length;
    const companyCount = index.indices.companies.length;

    // Count achievements and projects from master resume
    let achievementCount = 0;
    let projectCount = 0;
    let roleCount = 0;

    if (masterResume && typeof masterResume === 'object') {
      if (Array.isArray(masterResume.achievements)) {
        achievementCount = masterResume.achievements.length;
      }
      if (Array.isArray(masterResume.projects)) {
        projectCount = masterResume.projects.length;
      }
      if (Array.isArray(masterResume.roles)) {
        roleCount = masterResume.roles.length;
      }
    }

    return {
      skillCount,
      technologyCount,
      achievementCount,
      companyCount,
      projectCount,
      roleCount
    };
  }

  /**
   * Get loaded database
   */
  getDatabase(): ResumeDatabase | null {
    return this.database;
  }

  /**
   * Get top achievements by impact
   */
  getTopAchievements(limit: number = 20): string[] {
    if (!this.database) {
      return [];
    }

    return this.database.index.query_paths.get_top_achievements_by_impact.slice(0, limit);
  }

  /**
   * Get primary skills
   */
  getPrimarySkills(limit: number = 30): string[] {
    if (!this.database) {
      return [];
    }

    return this.database.index.indices.skills.primary.slice(0, limit);
  }

  /**
   * Get technologies
   */
  getTechnologies(limit: number = 40): string[] {
    if (!this.database) {
      return [];
    }

    return this.database.index.indices.technologies.slice(0, limit);
  }

  /**
   * Get roles by company
   */
  getRolesByCompany(): Record<string, string[]> {
    if (!this.database) {
      return {};
    }

    return this.database.index.lookup_tables.role_by_company;
  }

  /**
   * Resolve path relative to workspace
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
   * Check if path exists
   */
  private async checkPathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}