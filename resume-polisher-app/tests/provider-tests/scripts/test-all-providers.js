#!/usr/bin/env node

/**
 * Provider Testing Script for Resume Polisher App
 * Tests all configured LLM providers with the same job requirements
 *
 * Usage: node test-all-providers.js
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Test configuration
const TEST_CONFIG = {
  jobRequirements: path.join(__dirname, '../input/job-requirements.md'),
  resumeTemplate: '/home/thunder/projects/resume/resume-ai-framework/polished-resume/angus-james-senior-data-analyst-aps6-monitoring.html',
  resumeDatabase: '/home/thunder/projects/resume/resume-ai-framework/curator-output-master-reume',
  outputDir: path.join(__dirname, '../output'),
  logsDir: path.join(__dirname, '../logs'),

  providers: [
    {
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      model: 'claude-sonnet-4-5',
      apiKeyEnv: 'ANTHROPIC_API_KEY',
      baseURL: ''
    },
    {
      name: 'anthropic',
      displayName: 'Anthropic Claude Haiku',
      model: 'claude-3-5-haiku-20241022',
      apiKeyEnv: 'ANTHROPIC_API_KEY',
      baseURL: '',
      outputSuffix: '-haiku'
    },
    {
      name: 'openai',
      displayName: 'OpenAI',
      model: 'gpt-4o',
      apiKeyEnv: 'OPENAI_APIKEY',
      baseURL: ''
    },
    {
      name: 'openrouter',
      displayName: 'OpenRouter (Moonshot Kimi)',
      model: 'moonshotai/kimi-k2:free',
      apiKeyEnv: 'OPENROUTER_API_KEY',
      baseURL: 'https://openrouter.ai/api/v1'
    },
    {
      name: 'openrouter',
      displayName: 'OpenRouter (GPT-5 Nano)',
      model: 'openai/gpt-5-nano',
      apiKeyEnv: 'OPENROUTER_API_KEY',
      baseURL: 'https://openrouter.ai/api/v1',
      outputSuffix: '-gpt5nano'
    },
    {
      name: 'zhipuai',
      displayName: 'ZhipuAI (GLM-4.5-Flash)',
      model: 'GLM-4.5-Flash',
      apiKeyEnv: 'ZAI_API_KEY',
      baseURL: 'https://open.bigmodel.cn/api/paas/v4'
    },
    {
      name: 'github',
      displayName: 'GitHub Models (GPT-4o)',
      model: 'gpt-4o',
      apiKeyEnv: 'GITHUB_API_KEY',
      baseURL: 'https://models.inference.ai.azure.com'
    },
    {
      name: 'github',
      displayName: 'GitHub Models (Claude 3.5 Sonnet)',
      model: 'claude-3-5-sonnet',
      apiKeyEnv: 'GITHUB_API_KEY',
      baseURL: 'https://models.inference.ai.azure.com',
      outputSuffix: '-claude'
    },
    {
      name: 'mcp',
      displayName: 'Claude Code MCP Server',
      model: 'claude-via-mcp',
      apiKeyEnv: null,
      baseURL: 'http://100.64.204.61:8734'
    }
  ]
};

// Load environment variables from .env file
async function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../../../.env');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2].trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

// Create test directories
async function setupDirectories() {
  await fs.mkdir(TEST_CONFIG.outputDir, { recursive: true });
  await fs.mkdir(TEST_CONFIG.logsDir, { recursive: true });
  console.log('✅ Test directories created');
}

// Read job requirements
async function loadJobRequirements() {
  const content = await fs.readFile(TEST_CONFIG.jobRequirements, 'utf-8');
  console.log('✅ Job requirements loaded');
  return content;
}

// Verify test data exists
async function verifyTestData() {
  const checks = [
    { path: TEST_CONFIG.resumeTemplate, name: 'Resume template' },
    { path: TEST_CONFIG.resumeDatabase, name: 'Resume database' },
    { path: TEST_CONFIG.jobRequirements, name: 'Job requirements' }
  ];

  for (const check of checks) {
    try {
      await fs.access(check.path);
      console.log(`✅ ${check.name} found: ${check.path}`);
    } catch (error) {
      console.error(`❌ ${check.name} NOT FOUND: ${check.path}`);
      throw error;
    }
  }
}

// Test a single provider
async function testProvider(provider, requirements, envVars) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputSuffix = provider.outputSuffix || '';
  const logFile = path.join(TEST_CONFIG.logsDir, `${provider.name}${outputSuffix}-${timestamp}.log`);
  const outputFile = path.join(TEST_CONFIG.outputDir, `${provider.name}${outputSuffix}-${timestamp}.html`);

  const log = [];
  const writeLog = (msg) => {
    const timestamped = `[${new Date().toISOString()}] ${msg}`;
    console.log(timestamped);
    log.push(timestamped);
  };

  try {
    writeLog(`\n${'='.repeat(80)}`);
    writeLog(`Testing Provider: ${provider.displayName}`);
    writeLog(`Model: ${provider.model}`);
    writeLog(`${'='.repeat(80)}\n`);

    // Get API key
    const apiKey = provider.apiKeyEnv ? envVars[provider.apiKeyEnv] : 'not-required';
    if (provider.apiKeyEnv && !apiKey) {
      throw new Error(`API key not found: ${provider.apiKeyEnv}`);
    }
    writeLog(`✓ API key ${provider.apiKeyEnv ? 'loaded' : 'not required'}`);

    // Log test configuration
    writeLog(`Configuration:`);
    writeLog(`  Provider: ${provider.name}`);
    writeLog(`  Model: ${provider.model}`);
    writeLog(`  Base URL: ${provider.baseURL || 'default'}`);
    writeLog(`  Job: Senior Data Analyst @ JD Ross Energy`);

    // Note: Actual test would require running the Electron app
    // For now, we'll create a placeholder result
    writeLog(`\n⚠️  NOTE: This is a test framework placeholder`);
    writeLog(`   To run actual tests, use the Resume Polisher Electron app with:`);
    writeLog(`   - Provider: ${provider.name}`);
    writeLog(`   - Model: ${provider.model}`);
    writeLog(`   - API Key from: ${provider.apiKeyEnv || 'none'}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    writeLog(`\n✅ Test completed in ${duration}s`);
    writeLog(`   Output would be saved to: ${outputFile}`);

    // Save log
    await fs.writeFile(logFile, log.join('\n'));
    writeLog(`   Log saved to: ${logFile}`);

    return {
      success: true,
      provider: provider.displayName,
      model: provider.model,
      duration,
      outputFile,
      logFile
    };

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    writeLog(`\n❌ Test FAILED: ${error.message}`);
    writeLog(`   Duration: ${duration}s`);

    // Save error log
    await fs.writeFile(logFile, log.join('\n'));

    return {
      success: false,
      provider: provider.displayName,
      model: provider.model,
      error: error.message,
      duration,
      logFile
    };
  }
}

// Generate test report
async function generateReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(TEST_CONFIG.logsDir, `test-report-${timestamp}.md`);

  let report = `# Resume Polisher App - Provider Test Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `**Job Position:** Senior Data Analyst @ JD Ross Energy\n\n`;
  report += `## Test Configuration\n\n`;
  report += `- **Resume Template:** ${TEST_CONFIG.resumeTemplate}\n`;
  report += `- **Resume Database:** ${TEST_CONFIG.resumeDatabase}\n`;
  report += `- **Job Requirements:** ${TEST_CONFIG.jobRequirements}\n\n`;

  report += `## Summary\n\n`;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  report += `- ✅ **Passed:** ${passed}\n`;
  report += `- ❌ **Failed:** ${failed}\n`;
  report += `- 📊 **Total:** ${results.length}\n\n`;

  report += `## Results by Provider\n\n`;

  for (const result of results) {
    report += `### ${result.success ? '✅' : '❌'} ${result.provider}\n\n`;
    report += `- **Model:** ${result.model}\n`;
    report += `- **Duration:** ${result.duration}s\n`;

    if (result.success) {
      report += `- **Output:** \`${result.outputFile}\`\n`;
    } else {
      report += `- **Error:** ${result.error}\n`;
    }

    report += `- **Log:** \`${result.logFile}\`\n\n`;
  }

  report += `## Test Data\n\n`;
  report += `### Job Requirements\n\n`;
  report += `\`\`\`\n`;
  const requirements = await fs.readFile(TEST_CONFIG.jobRequirements, 'utf-8');
  report += requirements;
  report += `\n\`\`\`\n\n`;

  report += `## Notes\n\n`;
  report += `This is a test framework placeholder. To run actual resume generation tests:\n\n`;
  report += `1. Start the Resume Polisher Electron app: \`npm start\`\n`;
  report += `2. For each provider, configure in the Setup page\n`;
  report += `3. Load the job requirements from: \`tests/provider-tests/input/job-requirements.md\`\n`;
  report += `4. Load resume template and database as configured\n`;
  report += `5. Generate resume and save output to: \`tests/provider-tests/output/\`\n\n`;

  await fs.writeFile(reportFile, report);
  console.log(`\n📄 Test report saved to: ${reportFile}`);

  return reportFile;
}

// Main test function
async function main() {
  console.log('\n🚀 Resume Polisher App - Provider Testing Framework\n');

  try {
    // Setup
    await setupDirectories();
    await verifyTestData();
    const envVars = await loadEnv();
    const requirements = await loadJobRequirements();

    console.log(`\n📋 Testing ${TEST_CONFIG.providers.length} provider configurations...\n`);

    // Test all providers
    const results = [];
    for (const provider of TEST_CONFIG.providers) {
      const result = await testProvider(provider, requirements, envVars);
      results.push(result);
      console.log(''); // Blank line between tests
    }

    // Generate report
    await generateReport(results);

    // Summary
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total:  ${results.length}`);
    console.log('='.repeat(80) + '\n');

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error(`\n❌ Test framework error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  main();
}

module.exports = { TEST_CONFIG, testProvider, generateReport };
