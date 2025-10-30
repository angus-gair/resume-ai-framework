const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const Anthropic = require('@anthropic-ai/sdk');
const cheerio = require('cheerio');

let mainWindow;
let anthropicClient;

// Initialize Anthropic client
function initializeAI(apiKey) {
  anthropicClient = new Anthropic({
    apiKey: apiKey
  });
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
ipcMain.handle('initialize-api', async (event, apiKey) => {
  try {
    initializeAI(apiKey);
    // Test the connection
    await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });
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
    if (!anthropicClient) {
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

    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: agentPrompt }]
    });

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
    if (!anthropicClient) {
      return { success: false, error: 'API key not initialized' };
    }

    mainWindow.webContents.send('generation-progress', { stage: 'preparing', progress: 10 });

    // Read agent prompt
    const agentPath = path.join(__dirname, '..', 'agents', '3- Master-Resume-Creator.md');
    let agentInstructions = '';
    try {
      agentInstructions = await fs.readFile(agentPath, 'utf-8');
    } catch (e) {
      agentInstructions = 'You are a resume tailoring specialist.';
    }

    mainWindow.webContents.send('generation-progress', { stage: 'analyzing', progress: 30 });

    // Build context
    const topAchievements = database.index.query_paths.get_top_achievements_by_impact.slice(0, 20);
    const relevantSkills = database.index.indices.skills.primary.slice(0, 30);
    const technologies = database.index.indices.technologies.slice(0, 40);

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

    mainWindow.webContents.send('generation-progress', { stage: 'generating', progress: 50 });

    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    });

    mainWindow.webContents.send('generation-progress', { stage: 'finalizing', progress: 80 });

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
    mainWindow.webContents.send('generation-progress', { stage: 'message', progress: 90 });

    const messagePrompt = `Based on these position requirements, write a short, professional message (3-4 sentences) to send to the recruiter expressing interest in the role. Be specific about matching qualifications. Use Australian English.

Position Requirements:
${requirements}

Keep it concise, confident, and professional.`;

    const recruiterMessage = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: messagePrompt }]
    });

    mainWindow.webContents.send('generation-progress', { stage: 'complete', progress: 100 });

    return {
      success: true,
      tailoredHtml: tailoredHtml,
      recruiterMessage: recruiterMessage.content[0].text,
      generatedAt: new Date().toISOString()
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
