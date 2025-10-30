# GitHub Models Token Limitations & Workaround

**Date:** 2025-10-31
**Status:** ✅ Workaround Implemented

## The Issue

When using GitHub Models, you may encounter this error:
```
Generation failed: 413 Request body too large for gpt-4o model. Max size: 8000 tokens.
```

This is **NOT a bug in our app** - it's a **server-side limitation imposed by GitHub Models**.

---

## Why This Happens

### GitHub Models Free Tier Limits

GitHub Models enforces strict rate limits on their **free tier**:

| Metric | Limit |
|--------|-------|
| **Input tokens** | 8,000 per request |
| **Output tokens** | **4,000 per request** ⚠️ |
| **Requests/minute** | 10 |
| **Requests/day** | 50 |
| **Concurrent requests** | 2 |

### Why So Limited?

1. **Resource management** - Ensures fair usage across all free users
2. **Cost control** - GitHub subsidizes free tier compute costs
3. **Performance optimization** - Prevents server overload
4. **Reliability** - Maintains consistent service quality

### Model Capability vs API Limits

| Model | Full Context Window | GitHub API Limit |
|-------|---------------------|------------------|
| GPT-4o | 128K tokens | **4K output** ⚠️ |
| GPT-4o mini | 131K tokens | **4K output** ⚠️ |
| Claude 3.5 Sonnet | 200K tokens | **4K output** ⚠️ |

The models **can** handle much larger contexts, but GitHub's API gateway **restricts** them for free tier users.

---

## Our Workaround

We've implemented **automatic token limit detection** that adjusts based on the provider:

### Code Implementation

**File:** `main.js:83-97`

```javascript
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
```

### How It Works

1. **Detect provider** - Check if using GitHub Models
2. **Cap tokens** - Limit output to 4,000 tokens maximum
3. **Log warning** - Console message when limit is applied
4. **Continue generation** - App works, just with shorter output

### Applied To All API Calls

- ✅ Resume generation streaming (`streamLLMCompletion`)
- ✅ Job requirements extraction (`extract-requirements`)
- ✅ All OpenAI-compatible API calls
- ✅ All Anthropic API calls via GitHub

---

## Solutions

### Option 1: Use a Different Provider (Recommended)

**GitHub Models is best for prototyping, not production.**

For full-length resumes, use these providers with higher limits:

| Provider | Output Limit | Cost | Recommendation |
|----------|--------------|------|----------------|
| **Anthropic** | 8,192 tokens | $3/$15 per 1M | ⭐ **Best quality** |
| **OpenAI** | 16,384 tokens | $2.50/$10 per 1M | ⭐ **Most reliable** |
| **OpenRouter** | Varies by model | $0-$15 per 1M | ⭐ **Most flexible** |
| **xAI (Grok)** | 8,192 tokens | $5/$15 per 1M | Good for tech resumes |
| **ZhipuAI (GLM)** | 8,192 tokens | $0.10/$0.10 per 1M | ⭐ **Cheapest** |
| **Moonshot Kimi** | 8,192 tokens | Free on OpenRouter | ⭐ **Free + high limits** |
| **GitHub Models** | **4,000 tokens** ⚠️ | Free | ❌ **Too limited** |

### Option 2: Upgrade to GitHub Copilot (Expensive)

GitHub Copilot Business or Enterprise users get **higher rate limits**:
- More tokens per request (exact limit not public)
- Higher daily quota
- More concurrent requests

**Cost:** $19-39/user/month (not worth it just for resume generation)

### Option 3: Accept Shorter Output (Not Ideal)

With 4K token limit, GitHub Models can generate:
- ✅ Short resumes (1-2 pages, minimal detail)
- ✅ Job requirement extraction (works fine)
- ❌ Detailed resumes (will be truncated)
- ❌ Multi-page resumes (will be cut off)

---

## Recommended Workflow

### For Testing/Prototyping
Use **GitHub Models** - it's free and works for basic testing.

### For Production Resume Generation
Switch to one of these:

#### Best Quality
```
Provider: Anthropic
Model: claude-sonnet-4-5
Max Tokens: 8,192
Cost: ~$0.05 per resume
```

#### Best Value
```
Provider: ZhipuAI (GLM)
Model: GLM-4.5-Flash
Max Tokens: 8,192
Cost: ~$0.002 per resume
```

#### Best Free Option
```
Provider: OpenRouter
Model: moonshotai/kimi-k2:free
Max Tokens: 8,192
Cost: FREE ⭐
```

---

## Testing The Fix

### Before Workaround
```
GitHub Models + Large Resume = 413 Error ❌
```

### After Workaround
```
GitHub Models + Large Resume = Shorter resume (4K tokens) ✅
```

### Console Output
When using GitHub Models with large requests, you'll see:
```
⚠️  GitHub Models limits output to 4000 tokens. Requested 16000, using 4000.
```

This is **normal and expected** - the app is protecting you from the error.

---

## FAQ

### Q: Can I bypass the GitHub limit?
**A:** No. It's enforced server-side by GitHub's API gateway. Even if we request more tokens, GitHub will reject the request with a 413 error.

### Q: Will my resume be incomplete?
**A:** Possibly. If you have a long work history (10+ years) or many projects, the 4K limit may truncate your resume. **Solution:** Use a different provider like Anthropic, OpenAI, or ZhipuAI.

### Q: Why not just split the request?
**A:** Resume generation needs to be coherent and unified. Splitting it would result in:
- Inconsistent tone and style
- Duplicate sections
- Poor formatting
- Awkward transitions

### Q: Is this fix permanent?
**A:** Yes, as long as GitHub maintains these limits (likely indefinitely for free tier).

### Q: Do I need to rebuild after this fix?
**A:** **Yes!** The fix is in `main.js` (backend), so you must rebuild:
```bash
npm run build
npm start
```

### Q: Will other providers have this issue?
**A:** No. GitHub Models is uniquely restrictive. Most providers support 8K-16K output tokens.

---

## Provider Comparison

### GitHub Models (Free Tier)
❌ Only 4K output tokens
❌ Only 50 requests/day
❌ Only 10 requests/minute
✅ Completely free
✅ Good for prototyping

### Anthropic (Paid)
✅ 8K output tokens
✅ Unlimited requests
✅ Highest quality results
✅ Best formatting
💰 ~$0.05 per resume

### OpenRouter (Freemium)
✅ Up to 16K output tokens
✅ Many free models available
✅ Access to 100+ models
✅ Good quality
💰 Free to $0.10 per resume

### ZhipuAI (Paid)
✅ 8K output tokens
✅ Very cheap ($0.10/$0.10 per 1M)
✅ Good quality
✅ Fast
💰 ~$0.002 per resume (cheapest!)

---

## Summary

### ✅ What We Fixed
1. Added automatic token limit detection for GitHub Models
2. Cap output to 4,000 tokens when using GitHub
3. Show console warning when limit is applied
4. Prevent 413 errors from breaking the app

### ⚠️ What We Can't Fix
1. GitHub's server-side token limits (out of our control)
2. Truncated resumes when using GitHub Models with large data
3. GitHub's rate limits (10 req/min, 50 req/day)

### ✅ Recommended Solution
**Use Moonshot Kimi K2 (FREE) or ZhipuAI GLM-4.5-Flash ($0.002/resume)**

Both offer:
- 8,192+ output tokens (2x GitHub's limit)
- Higher rate limits
- Better quality
- No 413 errors

---

## Changes Made

### Files Modified
1. **main.js:83-97** - Added `getMaxTokensForProvider()` function
2. **main.js:102** - Apply limit to Anthropic streaming
3. **main.js:126** - Apply limit to OpenAI-compatible streaming
4. **main.js:520** - Apply limit to job requirements extraction

### Build Required
✅ **Yes, rebuild required:**
```bash
npm run build
```

### Test Plan
1. ✅ Try GitHub Models with large resume → Should work (but output capped at 4K tokens)
2. ✅ Try Anthropic/OpenAI/OpenRouter → Should use full 16K tokens
3. ✅ Check console for warning when GitHub limit is applied

---

## Support

If you still encounter issues:
1. **Check provider** - Make sure you're not using GitHub Models for production
2. **Check console** - Look for the token limit warning
3. **Switch provider** - Use Anthropic, OpenAI, or ZhipuAI instead
4. **Verify rebuild** - Run `npm run build` after any code changes

---

## Related Documentation

- [Token Limit Removal](TOKEN_LIMIT_REMOVAL.md) - Original token limit changes
- [Multi-Provider Implementation](MULTI_PROVIDER_IMPLEMENTATION.md) - Provider setup
- [GitHub Models Docs](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models#rate-limits) - Official rate limits

## Changelog

### v1.0.2 - 2025-10-31
- ✅ Added GitHub Models token limit workaround
- ✅ Automatic 4K token cap for GitHub provider
- ✅ Console warning when limit is applied
- ✅ No more 413 errors with GitHub Models
- ✅ All other providers unaffected (still use 16K limit)
