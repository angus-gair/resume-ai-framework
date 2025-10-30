const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const axios = require('axios');
const cheerio = require('cheerio');

let mainWindow;
let llmClient;
let llmProvider;
let llmModel;

// Initialize LLM client based on provider
function initializeLLM(config) {
  llmProvider = config.provider;
  llmModel = config.model;

  if (config.provider === 'anthropic') {
    llmClient = new Anthropic({
      apiKey: config.apiKey
    });
  } else if (config.provider === 'mcp') {
    // MCP Server integration
    llmClient = {
      mcpURL: config.baseURL || 'http://100.64.204.61:8734',
      async executeMCP(prompt, maxTokens) {
        const response = await axios.post(`${this.mcpURL}/mcp`, {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'claude_code_execute',
            arguments: {
              command: prompt,
              max_tokens: maxTokens
            }
          },
          id: Date.now()
        }, {
          timeout: 120000 // 2 minutes
        });
        return response.data.result;
      },
      // Wrap MCP in OpenAI-like interface for compatibility
      chat: {
        completions: {
          create: async function({ messages, max_tokens, stream }) {
            const prompt = messages[messages.length - 1].content;
            const result = await llmClient.executeMCP(prompt, max_tokens);

            if (stream) {
              // For now, return non-streaming response
              // TODO: Implement SSE streaming for MCP
              throw new Error('Streaming not yet supported for MCP provider');
            }

            return {
              choices: [{
                message: { content: result.output || result }
              }],
              usage: {
                prompt_tokens: Math.ceil(prompt.length / 4),
                completion_tokens: Math.ceil((result.output || result).length / 4)
              }
            };
          }
        }
      }
    };
  } else {
    // OpenAI-compatible providers: openai, openrouter, custom, xai, github
    const openaiConfig = {
      apiKey: config.apiKey,
    };
    if (config.baseURL) {
      openaiConfig.baseURL = config.baseURL;
    }
    llmClient = new OpenAI(openaiConfig);
  }
}

// Get provider-specific max token limits
function getMaxTokensForProvider(requestedTokens) {
  // GitHub Models has strict server-side limits
  if (llmProvider === 'github') {
    const limit = 4000; // GitHub free tier: 4K output max
    if (requestedTokens > limit) {
      console.warn(`⚠️  GitHub Models limits output to ${limit} tokens. Requested ${requestedTokens}, using ${limit}.`);
    }
    return Math.min(requestedTokens, limit);
  }

  // Other provider-specific limits can be added here
  // xAI, OpenRouter, etc. support higher limits
  return requestedTokens;
}

// Unified streaming function for all providers
async function streamLLMCompletion(prompt, maxTokens, onChunk, onProgress) {
  let fullText = '';
  let inputTokens = 0;
  let outputTokens = 0;

  // Apply provider-specific token limits
  const actualMaxTokens = getMaxTokensForProvider(maxTokens);

  if (llmProvider === 'anthropic') {
    const stream = await llmClient.messages.stream({
      model: llmModel,
      max_tokens: actualMaxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullText += text;
        if (onChunk) onChunk(text, fullText.length);
      } else if (chunk.type === 'message_start') {
        inputTokens = chunk.message.usage.input_tokens;
      } else if (chunk.type === 'message_delta') {
        outputTokens = chunk.usage.output_tokens;
      }
    }
  } else {
    // OpenAI-compatible streaming
    const stream = await llmClient.chat.completions.create({
      model: llmModel,
      max_tokens: actualMaxTokens,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullText += text;
        if (onChunk) onChunk(text, fullText.length);
      }

      // OpenAI provides usage in the last chunk
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }
    }

    // If usage wasn't in stream, estimate it (OpenRouter sometimes doesn't include it)
    if (!inputTokens) {
      inputTokens = Math.ceil(prompt.length / 4); // Rough estimate: 1 token ≈ 4 chars
      outputTokens = Math.ceil(fullText.length / 4);
    }
  }

  return { fullText, inputTokens, outputTokens };
}

// Provider-aware cost calculation
function calculateCost(inputTokens, outputTokens, provider, model) {
  // Default pricing structure (per 1M tokens)
  const pricing = {
    anthropic: {
      'claude-sonnet-4-5': { input: 3, output: 15 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-5-haiku-20241022': { input: 1, output: 5 },
    },
    openai: {
      'gpt-4o': { input: 2.5, output: 10 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gpt-4-turbo': { input: 10, output: 30 },
    },
    xai: {
      'grok-2': { input: 3, output: 12 },
      'grok-2-mini': { input: 0.75, output: 3 },
      'grok-beta': { input: 3, output: 12 }
    },
    zhipuai: {
      'GLM-4.5-Flash': { input: 0.10, output: 0.10 },
      'GLM-4-Plus': { input: 0.50, output: 0.50 },
      'GLM-4': { input: 1, output: 1 }
    },
    github: {
      // Free tier - no cost
      default: { input: 0, output: 0 }
    },
    mcp: {
      // Uses server's quota - no direct cost
      default: { input: 0, output: 0 }
    },
    openrouter: {
      // OpenRouter pricing varies by model - use conservative estimates
      default: { input: 3, output: 15 }
    },
    custom: {
      // Unknown pricing for custom endpoints
      default: { input: 0, output: 0 }
    }
  };

  let modelPricing;
  if (pricing[provider] && pricing[provider][model]) {
    modelPricing = pricing[provider][model];
  } else if (pricing[provider] && pricing[provider].default) {
    modelPricing = pricing[provider].default;
  } else {
    // Fallback to free if unknown
    modelPricing = { input: 0, output: 0 };
  }

  const costInput = (inputTokens / 1000000) * modelPricing.input;
  const costOutput = (outputTokens / 1000000) * modelPricing.output;
  return costInput + costOutput;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#1e293b',
    show: false
  });

  // Load app
  const isDev = process.env.NODE_ENV === 'development' && process.env.VITE_DEV_SERVER_URL;

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Try to load from dist, fallback to development HTML
    const distPath = path.join(__dirname, 'dist', 'index.html');
    const devPath = path.join(__dirname, 'index.html');

    try {
      mainWindow.loadFile(distPath);
    } catch {
      // If dist doesn't exist, we need to build first
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <html>
          <head>
            <title>Build Required</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #1e293b;
                color: #e2e8f0;
              }
              .container {
                text-align: center;
                max-width: 600px;
                padding: 2rem;
              }
              h1 { color: #0ea5e9; }
              pre {
                background: #0f172a;
                padding: 1rem;
                border-radius: 0.5rem;
                text-align: left;
                overflow-x: auto;
              }
              code { color: #38bdf8; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 Resume Polisher Setup</h1>
              <p>The app needs to be built before first use.</p>
              <h3>Run these commands in the terminal:</h3>
              <pre><code>cd ${__dirname}
npm run build
npm start</code></pre>
              <p>Or for development with hot reload:</p>
              <pre><code>npm run dev</code></pre>
            </div>
          </body>
        </html>
      `)}`);
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================================
// IPC Handlers
// ============================================

// Initialize API Key
ipcMain.handle('initialize-api', async (event, config) => {
  try {
    initializeLLM(config);

    // Test the API with a simple request
    if (config.provider === 'anthropic') {
      await llmClient.messages.create({
        model: config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
    } else if (config.provider === 'mcp') {
      // Test MCP server connection
      const healthCheck = await axios.get(`${llmClient.mcpURL}/health`, {
        timeout: 5000
      });
      if (!healthCheck.data || healthCheck.status !== 200) {
        throw new Error('MCP server health check failed');
      }
    } else {
      // OpenAI-compatible test (openai, xai, github, openrouter, custom)
      await llmClient.chat.completions.create({
        model: config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// File System Operations
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('select-file', async (event, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'HTML Files', extensions: ['html'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-yaml', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(content);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-json', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-path-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return { success: true, exists: true };
  } catch {
    return { success: true, exists: false };
  }
});

// ============================================
// Stage 1: Extract Position Requirements
// ============================================

ipcMain.handle('scrape-job-url', async (event, jobUrl) => {
  try {
    // Send progress update
    mainWindow.webContents.send('scraping-progress', { stage: 'fetching', progress: 30 });

    // Simple fetch approach - just get the HTML
    const response = await fetch(jobUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    mainWindow.webContents.send('scraping-progress', { stage: 'extracting', progress: 60 });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, .header, .footer, .nav, .menu, .sidebar').remove();

    // Try to extract main content
    let content = '';
    const selectors = [
      'main',
      '[role="main"]',
      '[data-automation="jobDescription"]',
      '[data-automation="jobAdDetails"]',
      '.job-details',
      '.job-description',
      'article',
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length && element.text().length > 100) {
        content = element.text();
        break;
      }
    }

    // Fallback to body
    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    mainWindow.webContents.send('scraping-progress', { stage: 'complete', progress: 100 });

    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extract-requirements', async (event, { jobUrl, pageContent }) => {
  try {
    if (!llmClient) {
      return { success: false, error: 'API key not initialized' };
    }

    mainWindow.webContents.send('extraction-progress', { stage: 'analyzing', progress: 20 });

    const agentPrompt = `You are a job requirements extraction specialist. Analyze the following job posting and extract:

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

    mainWindow.webContents.send('extraction-progress', { stage: 'processing', progress: 50 });

    // Use provider-specific API call
    let message;
    const maxTokens = getMaxTokensForProvider(16000);

    if (llmProvider === 'anthropic') {
      message = await llmClient.messages.create({
        model: llmModel,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: agentPrompt }]
      });
    } else {
      // OpenAI-compatible
      const response = await llmClient.chat.completions.create({
        model: llmModel,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: agentPrompt }]
      });
      // Convert to Anthropic-style response format for consistency
      message = {
        content: [{ text: response.choices[0].message.content }]
      };
    }

    mainWindow.webContents.send('extraction-progress', { stage: 'complete', progress: 100 });

    const requirements = message.content[0].text;

    return {
      success: true,
      requirements,
      metadata: {
        jobUrl,
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// Stage 2: Load and Browse Database
// ============================================

ipcMain.handle('load-database', async (event, databasePath) => {
  try {
    mainWindow.webContents.send('database-loading', { stage: 'reading', progress: 25 });

    // Load master_resume.yaml
    const yamlPath = path.join(databasePath, 'master_resume.yaml');
    const yamlResult = await fs.readFile(yamlPath, 'utf-8');
    const masterResume = yaml.load(yamlResult);

    mainWindow.webContents.send('database-loading', { stage: 'indexing', progress: 50 });

    // Load master_resume.index.json
    const indexPath = path.join(databasePath, 'master_resume.index.json');
    const indexResult = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexResult);

    mainWindow.webContents.send('database-loading', { stage: 'validating', progress: 75 });

    // Load evidence_map.json (optional)
    let evidenceMap = null;
    try {
      const evidencePath = path.join(databasePath, 'evidence_map.json');
      const evidenceResult = await fs.readFile(evidencePath, 'utf-8');
      evidenceMap = JSON.parse(evidenceResult);
    } catch (e) {
      // Evidence map is optional
    }

    mainWindow.webContents.send('database-loading', { stage: 'complete', progress: 100 });

    return {
      success: true,
      database: {
        masterResume,
        index,
        evidenceMap,
        path: databasePath
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// Stage 3: Generate Tailored Resume
// ============================================

ipcMain.handle('generate-tailored-resume', async (event, { requirements, templateHtml, database }) => {
  try {
    if (!llmClient) {
      return { success: false, error: 'API key not initialized' };
    }

    mainWindow.webContents.send('generation-progress', {
      stage: 'preparing',
      progress: 5,
      log: 'Initializing resume generation process...'
    });

    // Read agent prompt
    const agentPath = path.join(__dirname, '..', 'agents', '3- Master-Resume-Creator.md');
    let agentInstructions = '';
    try {
      agentInstructions = await fs.readFile(agentPath, 'utf-8');
      mainWindow.webContents.send('generation-progress', {
        stage: 'preparing',
        progress: 10,
        log: 'Loaded Master Resume Creator agent instructions'
      });
    } catch (e) {
      agentInstructions = 'You are a resume tailoring specialist.';
      mainWindow.webContents.send('generation-progress', {
        stage: 'preparing',
        progress: 10,
        log: 'Using default agent instructions'
      });
    }

    mainWindow.webContents.send('generation-progress', {
      stage: 'analyzing',
      progress: 15,
      log: 'Analyzing job requirements...'
    });

    mainWindow.webContents.send('generation-progress', {
      stage: 'analyzing',
      progress: 20,
      log: 'Querying resume database for matching achievements...'
    });

    // Build context
    mainWindow.webContents.send('generation-progress', {
      stage: 'analyzing',
      progress: 25,
      log: 'Building context from resume database...'
    });

    const topAchievements = database.index.query_paths.get_top_achievements_by_impact.slice(0, 20);
    const relevantSkills = database.index.indices.skills.primary.slice(0, 30);
    const technologies = database.index.indices.technologies.slice(0, 40);

    mainWindow.webContents.send('generation-progress', {
      stage: 'analyzing',
      progress: 30,
      log: `Found ${topAchievements.length} top achievements, ${relevantSkills.length} skills, ${technologies.length} technologies`
    });

    const prompt = `${agentInstructions}

## Task: Generate Tailored Resume

### Position Requirements:
${requirements}

### Current Resume Template:
${templateHtml}

### Available Resume Database Summary:

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

## CRITICAL INSTRUCTIONS:

You MUST generate the complete HTML resume document NOW. DO NOT ask questions or request confirmation.

1. Analyze the position requirements and identify the most relevant achievements, skills, and technologies from the database
2. Tailor the resume HTML to emphasize matching qualifications
3. Maintain Australian English spelling throughout
4. Use evidence-backed achievements with quantified metrics
5. Focus on the top 8-12 most relevant achievements
6. Optimize for ATS (Applicant Tracking Systems) by using clear section headings and keywords

IMPORTANT OUTPUT FORMAT:
- Start with: <!DOCTYPE html>
- Include complete HTML structure with <html>, <head>, <body> tags
- Include all CSS styles inline or in <style> tags
- End with: </html>
- DO NOT include any explanations, questions, or markdown
- DO NOT ask for confirmation
- Generate the complete resume immediately`;

    mainWindow.webContents.send('generation-progress', {
      stage: 'generating',
      progress: 35,
      log: `Preparing prompt for ${llmProvider} (${llmModel})...`
    });

    mainWindow.webContents.send('generation-progress', {
      stage: 'generating',
      progress: 40,
      log: `Sending request to ${llmProvider} API...`
    });

    mainWindow.webContents.send('generation-progress', {
      stage: 'generating',
      progress: 45,
      log: 'Waiting for AI to analyze requirements and select matching achievements...'
    });

    mainWindow.webContents.send('generation-progress', {
      stage: 'generating',
      progress: 50,
      log: 'AI is now analyzing and generating...',
      streamStart: true
    });

    // Use unified streaming function for all providers
    const resumeResult = await streamLLMCompletion(
      prompt,
      16000,
      (text, length) => {
        // Send streaming chunk to frontend
        mainWindow.webContents.send('generation-progress', {
          stage: 'generating',
          progress: Math.min(50 + (length / 200), 70),
          streamChunk: text,
          streamLength: length
        });
      }
    );

    mainWindow.webContents.send('generation-progress', {
      stage: 'generating',
      progress: 70,
      log: `AI response received (${resumeResult.fullText.length} characters)`,
      streamEnd: true
    });

    const message = {
      content: [{ text: resumeResult.fullText }],
      usage: {
        input_tokens: resumeResult.inputTokens,
        output_tokens: resumeResult.outputTokens
      }
    };

    mainWindow.webContents.send('generation-progress', {
      stage: 'finalizing',
      progress: 75,
      log: 'Processing AI response and extracting HTML...'
    });

    let tailoredHtml = message.content[0].text;

    // Extract HTML if wrapped in markdown or has extra text
    if (tailoredHtml.includes('```html')) {
      const match = tailoredHtml.match(/```html\n([\s\S]*?)\n```/);
      if (match) tailoredHtml = match[1];
    } else if (tailoredHtml.includes('```')) {
      const match = tailoredHtml.match(/```\n([\s\S]*?)\n```/);
      if (match) tailoredHtml = match[1];
    }

    // Extract just the HTML document if there's extra text
    if (!tailoredHtml.trim().startsWith('<!DOCTYPE') && !tailoredHtml.trim().startsWith('<html')) {
      const docStart = tailoredHtml.indexOf('<!DOCTYPE');
      const htmlStart = tailoredHtml.indexOf('<html');
      const start = docStart !== -1 ? docStart : htmlStart;
      if (start !== -1) {
        tailoredHtml = tailoredHtml.substring(start);
      }
    }

    // Trim to last closing html tag
    const lastHtmlClose = tailoredHtml.lastIndexOf('</html>');
    if (lastHtmlClose !== -1) {
      tailoredHtml = tailoredHtml.substring(0, lastHtmlClose + 7);
    }

    // Generate recruiter message
    mainWindow.webContents.send('generation-progress', {
      stage: 'message',
      progress: 80,
      log: 'Validating generated HTML structure...'
    });

    mainWindow.webContents.send('generation-progress', {
      stage: 'message',
      progress: 85,
      log: 'Generating personalized recruiter message...',
      streamStart: true
    });

    const messagePrompt = `Based on these position requirements, write a short, professional message (3-4 sentences) to send to the recruiter expressing interest in the role. Be specific about matching qualifications. Use Australian English.

Position Requirements:
${requirements}

Keep it concise, confident, and professional.`;

    // Use unified streaming function for recruiter message
    const recruiterResult = await streamLLMCompletion(
      messagePrompt,
      1000,
      (text, length) => {
        mainWindow.webContents.send('generation-progress', {
          stage: 'message',
          progress: Math.min(85 + (length / 50), 95),
          streamChunk: text,
          streamLength: length
        });
      }
    );

    mainWindow.webContents.send('generation-progress', {
      stage: 'message',
      progress: 95,
      log: 'Recruiter message generated successfully',
      streamEnd: true
    });

    const recruiterMessage = {
      content: [{ text: recruiterResult.fullText }],
      usage: {
        input_tokens: recruiterResult.inputTokens,
        output_tokens: recruiterResult.outputTokens
      }
    };

    mainWindow.webContents.send('generation-progress', {
      stage: 'complete',
      progress: 100,
      log: 'Resume generation complete! Ready for review.'
    });

    // Calculate token usage and cost
    const inputTokens = message.usage.input_tokens + recruiterMessage.usage.input_tokens;
    const outputTokens = message.usage.output_tokens + recruiterMessage.usage.output_tokens;

    // Use provider-aware cost calculation
    const totalCost = calculateCost(inputTokens, outputTokens, llmProvider, llmModel);

    return {
      success: true,
      tailoredHtml: tailoredHtml,
      recruiterMessage: recruiterMessage.content[0].text,
      generatedAt: new Date().toISOString(),
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        costUSD: totalCost
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// Stage 4: Export
// ============================================

ipcMain.handle('save-resume', async (event, { html, outputPath }) => {
  try {
    await fs.writeFile(outputPath, html, 'utf-8');
    return { success: true, path: outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-pdf', async (event, { html, outputPath }) => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle' });

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

    return { success: true, path: outputPath };
  } catch (error) {
    if (browser) await browser.close();
    return { success: false, error: error.message };
  }
});

// ============================================
// Utility Handlers
// ============================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
  return { success: true };
});
