# Demo Guide - AI Dev Orchestrator

Quick guide to running the live demonstrations of the AI Dev Orchestrator.

## Prerequisites

1. **API Key Setup**
   ```bash
   # Make sure your .env file has a valid Anthropic API key
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

2. **Dependencies Installed**
   ```bash
   npm install
   ```

## Available Demos

### 1. Quick Demo (Recommended)
Single task execution with planning and review.

```bash
npx tsx demo.ts
```

**What it demonstrates:**
- Task planning (creates 7 structured tasks)
- Task execution (executes first task)
- Code review (reviews generated code)

**Execution time:** ~30-60 seconds

---

### 2. Demo with Logging
Same as Quick Demo but saves results to a file.

```bash
npx tsx demo-with-log.ts
```

**Output:** Creates `demo-result-TIMESTAMP.txt` with all results

---

### 3. Full Orchestration Demo
Complete workflow with all tasks executed.

```bash
npx tsx run-demo.ts
```

**What it demonstrates:**
- Full planning phase
- Execution of all tasks in dependency order
- Parallel task execution when possible
- Complete code review of all outputs

**Execution time:** ~3-5 minutes
**Note:** May hit rate limits on free tier

---

### 4. Basic Usage Example
Example from documentation showing full API usage.

```bash
npx tsx src/examples/basic-usage.ts
```

---

### 5. Individual Agents Example
Shows how to use each agent independently.

```bash
npx tsx src/examples/individual-agents.ts
```

**What it demonstrates:**
- Task planning independently
- Task execution independently
- Code review independently
- Context expansion independently

---

## Expected Output

### Task Planning Output
```
📋 PLANNED TASKS:
  [1] BOOTSTRAP: Initialize TypeScript project...
  [2] CODE: Create calculator function... (depends on: 1)
  [3] CODE: Add input validation... (depends on: 2)
  ...
```

### Task Execution Output
```
💻 TASK EXECUTION:
  Task executed successfully!

  Result: [Generated code and configuration files]
```

### Code Review Output
```
🔍 CODE REVIEW:
  Status: REWORK
  Issues found: 8

  1. [MEDIUM] Missing security dependencies
     File: package.json
  2. [LOW] Bundle size optimization needed
     File: tsconfig.json
  ...
```

---

## Troubleshooting

### Rate Limit Errors

```
Error: 429 rate_limit_error
```

**Solution:** Wait 1-2 minutes and try again. The free tier has limits:
- 8,000 output tokens per minute
- 30,000 input tokens per minute
- 50 requests per minute

### API Key Errors

```
Error: invalid x-api-key
```

**Solution:**
1. Check your `.env` file
2. Verify API key is valid
3. Make sure there are no extra spaces

### Import Errors

```
Error: Cannot find module
```

**Solution:**
```bash
npm install
npm run build
```

---

## Rate Limit Best Practices

1. **Start with Quick Demo** - Uses minimal tokens
2. **Wait between runs** - Allow rate limits to reset
3. **Use smaller goals** - For testing, use simple objectives
4. **Monitor headers** - Check `anthropic-ratelimit-*` headers

---

## Demo Results

For detailed results of a successful demo run, see [DEMO_RESULTS.md](DEMO_RESULTS.md).

---

## Next Steps After Demo

1. **Explore the code** - Check how agents are implemented
2. **Modify prompts** - Customize agent behavior in `src/prompts/v1/`
3. **Create custom agents** - Add specialized agents for your needs
4. **Build workflows** - Combine agents for complex tasks

---

## Support

- **Issues:** https://github.com/josemarjp/ai-dev-orchestrator/issues
- **Documentation:** [README.md](README.md)
- **API Limits:** https://docs.claude.com/en/api/rate-limits

---

**Happy orchestrating! 🚀**
