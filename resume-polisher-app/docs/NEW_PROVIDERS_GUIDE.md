# New LLM Providers Integration Guide

## Overview

Resume Polisher App now supports **7 LLM providers** with **100+ models** available:

1. **Anthropic** (Claude models) - Original
2. **OpenAI** (GPT models) - Original
3. **OpenRouter** (100+ models) - Original
4. **Custom** (OpenAI-compatible endpoints) - Original
5. **xAI (Grok)** - NEW ⚡
6. **GitHub Models** - NEW 🎁 FREE TIER
7. **Claude Code MCP** - NEW 🔗 ADVANCED

---

## 🚀 xAI (Grok Models)

### What is it?
xAI's Grok models provide cutting-edge AI capabilities with real-time information access and long context windows.

### Available Models
- **Grok 2** - Latest flagship model
- **Grok 2 Mini** - Faster, more cost-effective variant
- **Grok Beta** - Beta testing model with latest features

### Pricing
- **Grok 2**: $3 per 1M input tokens, $12 per 1M output tokens
- **Grok 2 Mini**: $0.75 per 1M input tokens, $3 per 1M output tokens
- **Grok Beta**: Variable pricing

### How to Get Started

1. **Get API Key:**
   - Visit https://console.x.ai
   - Sign up/login with your X (Twitter) account
   - Navigate to API section
   - Generate new API key (format: `xai-...`)

2. **Configure in Resume Polisher:**
   - Select "xAI (Grok)" as provider
   - Choose your model
   - Enter API key: `xai-YOUR_KEY`
   - Base URL is pre-configured: `https://api.x.ai/v1`
   - Click "Initialize API"

### Features
- ⚡ **Real-time information access** (when enabled)
- 📚 **Long context window** (up to 128k tokens)
- 🔍 **Internet search integration** (optional)
- 💬 **Advanced conversational AI**

### Best For
- Production use cases
- Resume tailoring requiring current information
- High-quality content generation
- When Claude/GPT are unavailable

---

## 🎁 GitHub Models (FREE TIER)

### What is it?
GitHub Models provides **FREE** access to 20+ AI models from multiple providers for prototyping and development.

### Available Models
All models FREE with rate limits:

**OpenAI:**
- GPT-4o
- GPT-4o Mini

**Anthropic:**
- Claude 3.5 Sonnet
- Claude 3.5 Haiku

**Meta:**
- Llama 3.1 405B
- Llama 3.1 70B

**Google:**
- Gemini 1.5 Pro

**Mistral:**
- Mistral Large

### Pricing
**100% FREE** with the following limits:
- **15 requests per minute** per model
- **150 requests per day** per model
- Perfect for resume generation (1 resume = 1-2 requests)

### How to Get Started

1. **Get GitHub Token:**
   - Visit https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - No special scopes needed
   - Generate token (format: `github_pat_...`)

2. **Configure in Resume Polisher:**
   - Select "GitHub Models" as provider
   - Choose any of the 8 available models
   - Enter GitHub Personal Access Token
   - Base URL is pre-configured: `https://models.inference.ai.azure.com`
   - Click "Initialize API"

### Rate Limit Handling
The app will:
- Show clear error if rate limit exceeded
- Display quota information
- Suggest trying again later

### Features
- 🆓 **Completely FREE** (rate limited)
- 🌈 **Multi-provider access** with single token
- 🚀 **No credit card required**
- 🧪 **Perfect for prototyping**

### Best For
- Personal resume generation (150/day is plenty)
- Testing different models without cost
- Development and prototyping
- Users without paid API subscriptions

### Limitations
- Rate limits may be restrictive for bulk operations
- Not suitable for production at scale
- Requires GitHub account

---

## 🔗 Claude Code MCP Server (ADVANCED)

### What is it?
The Claude Code MCP (Model Context Protocol) Server allows you to use a Claude Code instance remotely as an LLM provider. This gives you access to Claude's agent capabilities, file system tools, and bash execution.

### Architecture
```
Resume Polisher App
    ↓ HTTP/SSE (MCP Protocol)
MCP Server (Express on 100.64.204.61:8734)
    ↓ Uses OAuth tokens
Claude Code CLI
    ↓ Authenticated requests
Anthropic API
```

### Features
- 🤖 **Agent-based generation** using Claude Code
- 📁 **File system operations** during resume creation
- 💻 **Bash command execution**
- 🔐 **No API key needed** (uses Claude Code instance)
- 🌐 **Secure Tailscale connection**

### Prerequisites

**Server Side:**
1. Claude Code installed and authenticated
2. MCP server running: `npx claude-code-mcp-server`
3. Tailscale installed and connected
4. Server bound to: `100.64.204.61:8734`

**Client Side:**
1. Tailscale installed and connected to same network
2. Network access to `100.64.204.61:8734`

### How to Get Started

1. **Setup MCP Server:**
   ```bash
   # On server machine
   npm install -g claude-code-mcp-server
   npx claude-code-mcp-server
   # Server will start on Tailscale IP: 100.64.204.61:8734
   ```

2. **Configure in Resume Polisher:**
   - Select "Claude Code MCP" as provider
   - Model: "Claude (via MCP)"
   - **No API key needed** - leave blank
   - Base URL: `http://100.64.204.61:8734` (pre-filled)
   - Click "Initialize API" (tests connection)

3. **Verify Connection:**
   - App will test MCP server health endpoint
   - Green success message confirms connection
   - Red error if server unreachable

### Pricing
**FREE** - Uses your existing Claude Code instance:
- If you have Claude Pro subscription: completely free
- If using Claude Code with API key: counts against your API quota
- Cost-effective for occasional use

### Rate Limits
- 100 requests per 15 minutes
- Per MCP server instance

### Security
- ✅ Bound to Tailscale private network (100.64.204.61)
- ✅ No public internet exposure
- ✅ Uses existing Claude OAuth credentials
- ✅ Rate limiting built-in

### Best For
- Advanced users with Claude Code setup
- Resume generation requiring file operations
- Complex workflows with bash commands
- Users with Claude Pro subscription (free)
- Secure private network environments

### Not Recommended For
- Public deployments
- Users without Tailscale
- Time-critical operations (slower than direct API)
- Users unfamiliar with MCP protocol

### Troubleshooting

**"MCP server health check failed":**
- Verify Tailscale is running and connected
- Check server is running: `curl http://100.64.204.61:8734/health`
- Ensure firewall allows port 8734
- Verify base URL in settings

**"Streaming not yet supported for MCP provider":**
- MCP currently uses non-streaming responses
- This is expected behavior
- Full response returned after generation completes

---

## Provider Comparison Table

| Feature | xAI | GitHub Models | MCP Server |
|---------|-----|---------------|------------|
| **Cost** | $0.75-12/1M | FREE | FREE* |
| **Setup Complexity** | Easy | Easy | Medium |
| **Models Available** | 3 | 8+ | 1 |
| **Rate Limits** | Standard | 15/min, 150/day | 100 per 15min |
| **Network Requirement** | Internet | Internet | Tailscale VPN |
| **API Key Needed** | Yes (`xai-...`) | Yes (`github_pat_...`) | No |
| **Real-time Data** | Yes | No | Via Claude Code |
| **Streaming** | Yes | Yes | No (yet) |
| **Best For** | Production | Free tier | Advanced users |

*Uses Claude Code instance quota

---

## Quick Start Recommendations

### For Individual Users (Free)
**Use GitHub Models:**
- 150 requests/day is perfect for daily resume tailoring
- No cost
- Multiple models to choose from
- Easy GitHub token setup

### For Production / Business Use
**Use xAI (Grok) or Anthropic (Claude):**
- Reliable API SLA
- Higher rate limits
- Better for bulk operations
- Pay-as-you-go pricing

### For Advanced Workflows
**Use MCP Server:**
- If you have Claude Pro subscription (free)
- Complex resume generation with file operations
- Secure private network setup
- Access to Claude Code agent capabilities

### For Cost Optimization
1. **GitHub Models** - Free tier for personal use
2. **xAI Grok 2 Mini** - $0.75/$3 per 1M tokens (cheapest paid option)
3. **OpenRouter** - Access to many cheap models
4. **MCP Server** - Free if Claude Pro subscriber

---

## Common Issues & Solutions

### xAI

**"Invalid API key" error:**
- Ensure key format is `xai-...`
- Regenerate key at console.x.ai
- Check for extra spaces

**Rate limit errors:**
- Standard API rate limits apply
- Upgrade account for higher limits
- Try Grok 2 Mini for higher throughput

### GitHub Models

**"Rate limit exceeded" error:**
- Wait for rate limit reset (1 minute for per-minute limit)
- Try different model (each has separate quota)
- Use different GitHub token

**Token not working:**
- Ensure token is Personal Access Token (classic or fine-grained)
- No specific scopes needed for GitHub Models
- Regenerate token if issues persist

### MCP Server

**Cannot connect to server:**
- Verify Tailscale running: `tailscale status`
- Check server health: `curl http://100.64.204.61:8734/health`
- Ensure MCP server process is running
- Check firewall rules

**Slow response times:**
- MCP adds network hop overhead
- Consider using direct API for time-critical tasks
- Check Tailscale network latency

**"Claude Code not authenticated" error:**
- On server: Run `claude auth status`
- If not authenticated: `claude auth login`
- Restart MCP server after authentication

---

## Migration Guide

### From Anthropic to GitHub Models (Free Tier)
1. Get GitHub Personal Access Token
2. Change provider to "GitHub Models"
3. Select "Claude 3.5 Sonnet" or "Claude 3.5 Haiku"
4. Same quality, now free (rate limited)!

### From OpenAI to xAI (Better Real-time Data)
1. Get xAI API key from console.x.ai
2. Change provider to "xAI (Grok)"
3. Select "Grok 2" or "Grok 2 Mini"
4. Enjoy real-time information access

### From Any Provider to MCP (Advanced Features)
1. Setup MCP server on Tailscale network
2. No API key needed!
3. Uses your Claude Code instance
4. Access to agent capabilities

---

## Support & Resources

### xAI
- Console: https://console.x.ai
- Documentation: https://x.ai/api
- Pricing: https://x.ai/pricing

### GitHub Models
- Marketplace: https://github.com/marketplace/models
- Token Setup: https://github.com/settings/tokens
- Documentation: https://docs.github.com/en/github-models

### MCP Server
- Claude Code: https://docs.claude.com/claude-code
- MCP Documentation: https://modelcontextprotocol.io
- Server Repo: https://github.com/anthropics/claude-code-mcp-server

---

## Changelog

### v2.0.0 - Multi-Provider Expansion
- ✅ Added xAI (Grok) support
- ✅ Added GitHub Models (free tier)
- ✅ Added Claude Code MCP server integration
- ✅ Provider badges in UI
- ✅ Info panels for each provider
- ✅ Unified pricing calculation
- ✅ MCP health check integration
- ✅ 7 total providers, 100+ models

### Previous
- v1.0.0 - Anthropic, OpenAI, OpenRouter, Custom support
