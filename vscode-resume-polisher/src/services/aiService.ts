/**
 * AI service for Claude API integration
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import { ResumeDatabase } from '../types/state';

export class AIService {
  private client: Anthropic | null = null;
  private readonly context: vscode.ExtensionContext;
  private readonly progressCallback?: (stage: string, progress: number, message?: string) => void;

  constructor(
    context: vscode.ExtensionContext,
    progressCallback?: (stage: string, progress: number, message?: string) => void
  ) {
    this.context = context;
    this.progressCallback = progressCallback;
  }

  /**
   * Initialize Claude API client
   */
  async initialize(): Promise<boolean> {
    try {
      // Get API key from secrets
      const apiKey = await this.context.secrets.get('resumePolisher.anthropicApiKey');
      
      if (!apiKey) {
        // Prompt user for API key
        const inputKey = await vscode.window.showInputBox({
          prompt: 'Enter your Anthropic Claude API key',
          password: true,
          placeHolder: 'sk-ant-...',
          ignoreFocusOut: true
        });

        if (!inputKey) {
          return false;
        }

        // Store in secrets
        await this.context.secrets.store('resumePolisher.anthropicApiKey', inputKey);
        this.client = new Anthropic({ apiKey: inputKey });
      } else {
        this.client = new Anthropic({ apiKey });
      }

      // Test connection
      await this.testConnection();
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to initialize Claude API: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Test API connection
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('API client not initialized');
    }

    await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
  }

  /**
   * Extract job requirements from page content
   */
  async extractRequirements(jobUrl: string, pageContent: string): Promise<string> {
    if (!this.client) {
      throw new Error('API client not initialized');
    }

    this.progressCallback?.('analyzing', 20);

    const prompt = `You are a job requirements extraction specialist. Analyze the following job posting and extract:

1. **Job Title**: The exact position title
2. **Company**: Company name
3. **Location**: Work location (remote/hybrid/on-site and city)
4. **Key Responsibilities**: Main duties and responsibilities
5. **Required Skills**: Must-have technical and soft skills
6. **Preferred Skills**: Nice-to-have skills
7. **Qualifications**: Education, experience, certifications
8. **Key Technologies**: Specific tools, languages, frameworks mentioned
9. **Salary Range**: If mentioned
10. **Benefits**: Key benefits mentioned

Format the output in clean markdown with clear sections. Focus on extracting factual information without interpretation.

Job Posting Content:
${pageContent}`;

    this.progressCallback?.('processing', 50);

    const message = await this.client.messages.create({
      model: this.getModel(),
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    this.progressCallback?.('complete', 100);

    return message.content[0].type === 'text' ? message.content[0].text : '';
  }

  /**
   * Generate tailored resume
   */
  async generateTailoredResume(
    requirements: string,
    templateHtml: string,
    database: ResumeDatabase
  ): Promise<{ tailoredHtml: string; recruiterMessage: string }> {
    if (!this.client) {
      throw new Error('API client not initialized');
    }

    this.progressCallback?.('preparing', 10);

    // Load agent instructions
    const agentInstructions = await this.getAgentInstructions();

    this.progressCallback?.('analyzing', 30);

    // Build context from database
    const topAchievements = database.index.query_paths.get_top_achievements_by_impact.slice(0, 20);
    const relevantSkills = database.index.indices.skills.primary.slice(0, 30);
    const technologies = database.index.indices.technologies.slice(0, 40);

    const prompt = `${agentInstructions}

## Task: Generate Tailored Resume

### Position Requirements:
${requirements}

### Current Resume Template (USE THIS AS THE BASE):
${templateHtml}

### Available Resume Database Summary (USE TO ENHANCE THE TEMPLATE):

**Top Achievements:**
${topAchievements.map((a, i) => `${i + 1}. ${a}`).join('\n')}

**Primary Skills:**
${relevantSkills.join(', ')}

**Technologies:**
${technologies.join(', ')}

**Roles Available:**
${Object.keys(database.index.lookup_tables.role_by_company).map(company =>
  `- ${company}: ${database.index.lookup_tables.role_by_company[company].join(', ')}`
).join('\n')}

## Instructions:

1. **USE THE TEMPLATE HTML AS THE BASE** - Keep the existing structure, styling, and layout
2. Analyze the position requirements and identify the most relevant achievements, skills, and technologies from the database
3. **REFINE (don't rewrite)** the template by:
   - Swapping or emphasizing 1-2 projects for better relevance
   - Updating skill tags to match position requirements
   - Adjusting language to mirror job terminology
   - Enhancing achievements with quantified metrics from database
4. Maintain Australian English spelling throughout (organised, analysed, optimised)
5. Use evidence-backed achievements with specific metrics
6. Ensure the output is a complete, valid HTML document
7. Focus on the top 8-12 most relevant achievements
8. Optimize for ATS (Applicant Tracking Systems) by using clear section headings and keywords
9. **Make surgical edits only** - preserve the template's authenticity and structure

Return ONLY the complete HTML document, no explanations or markdown formatting.`;

    this.progressCallback?.('generating', 50, 'Generating tailored resume...');

    const config = vscode.workspace.getConfiguration('resumePolisher');
    const maxTokens = config.get<number>('maxTokens') ?? 8000;

    const message = await this.client.messages.create({
      model: this.getModel(),
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    this.progressCallback?.('finalizing', 80);

    const tailoredHtml = message.content[0].type === 'text' ? message.content[0].text : '';

    // Generate recruiter message
    this.progressCallback?.('message', 90, 'Generating recruiter message...');

    const messagePrompt = `Based on these position requirements, write a short, professional message (3-4 sentences) to send to the recruiter expressing interest in the role. Be specific about matching qualifications. Use Australian English.

Position Requirements:
${requirements}

Keep it concise, confident, and professional.`;

    const recruiterMessageResponse = await this.client.messages.create({
      model: this.getModel(),
      max_tokens: 500,
      messages: [{ role: 'user', content: messagePrompt }]
    });

    const recruiterMessage = recruiterMessageResponse.content[0].type === 'text' 
      ? recruiterMessageResponse.content[0].text 
      : '';

    this.progressCallback?.('complete', 100);

    return { tailoredHtml, recruiterMessage };
  }

  /**
   * Get agent instructions (custom or default)
   */
  private async getAgentInstructions(): Promise<string> {
    const config = vscode.workspace.getConfiguration('resumePolisher');
    const customInstructions = config.get<string>('agentInstructions');

    if (customInstructions && customInstructions.trim()) {
      return customInstructions;
    }

    // Load default instructions from agents/4-Resume-Refinement-Agent
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        return this.getDefaultInstructions();
      }

      const agentPath = path.join(
        workspaceFolders[0].uri.fsPath,
        'agents',
        '4-Resume-Refinement-Agent'
      );

      const content = await fs.readFile(agentPath, 'utf-8');
      return content;
    } catch (error) {
      // Fallback to embedded default
      return this.getDefaultInstructions();
    }
  }

  /**
   * Get default agent instructions (fallback)
   */
  private getDefaultInstructions(): string {
    return `# Resume Refinement Agent

## Mission
Refine and tailor an existing master resume to align more closely with a specific job opportunity — without changing the overall structure, voice, or verified content.

## Core Objective
Apply surgical-level edits to strengthen job alignment through:
- Subtle language adjustments to mirror job terminology
- Swapping, adding, or removing 1–2 projects for relevance
- Updating skills, tools, and technologies to match the target role
- Preserving all metrics, achievements, and verified evidence
- Ensuring tone and spelling adhere to Australian/British English standards

## Processing Framework

### 1. Target Role Mapping
Analyze the job description for:
- Key competencies, technologies, and domain focus areas
- Core responsibilities and deliverables
- Tone, seniority, and stakeholder expectations

### 2. Selective Resume Adjustments
Make light-touch refinements that enhance fit:
- Replace or adjust up to 15% of total content
- Add or remove 1–2 projects that increase relevance
- Modify skill tags or keywords to match the role's requirements
- Update technology mentions for alignment
- Maintain the resume's timeline, style, and format integrity

Avoid:
- Rewriting sections wholesale
- Adding unverifiable claims or inflated metrics
- Removing evidence-backed achievements

### 3. Language & Consistency Controls
- Use Australian/British English consistently
- Maintain professional, concise, and confident tone
- Avoid exaggerated or marketing-heavy language
- Ensure all edits read naturally and preserve the candidate's authentic voice

## Output Quality Benchmarks
✅ Relevance Uplift: ≥15% better alignment with target role's language and focus
✅ Structural Fidelity: <15% deviation in overall length or format
✅ Evidence Integrity: 100% retention of verified achievements and timelines
✅ Clarity: Improved flow and readability without verbosity

## Guiding Principle
"Refine, don't rewrite."
Preserve the master resume's authenticity — only adjust language, emphasis, and examples to better align with the specific role's expectations while maintaining integrity, evidence, and continuity.`;
  }

  /**
   * Get configured model
   */
  private getModel(): string {
    const config = vscode.workspace.getConfiguration('resumePolisher');
    return config.get<string>('model') ?? 'claude-3-5-sonnet-20241022';
  }

  /**
   * Update API key
   */
  async updateAPIKey(): Promise<boolean> {
    const newKey = await vscode.window.showInputBox({
      prompt: 'Enter your new Anthropic Claude API key',
      password: true,
      placeHolder: 'sk-ant-...',
      ignoreFocusOut: true
    });

    if (!newKey) {
      return false;
    }

    await this.context.secrets.store('resumePolisher.anthropicApiKey', newKey);
    this.client = new Anthropic({ apiKey: newKey });

    try {
      await this.testConnection();
      vscode.window.showInformationMessage('API key updated successfully!');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to validate API key: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }
}