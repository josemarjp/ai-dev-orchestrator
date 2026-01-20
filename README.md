# AI Dev Orchestrator

An intelligent agentic system that orchestrates AI-powered development workflows using multiple specialized agents.

## Features

- **Task Planning**: Automatically breaks down development goals into structured, actionable tasks
- **Task Execution**: Executes development tasks with AI assistance
- **Code Review**: Provides intelligent code reviews with severity-categorized feedback
- **Context Expansion**: Gathers and provides additional technical context
- **Project Bootstrap**: Generates complete project structures and configurations
- **Dependency Management**: Handles task dependencies and executes in optimal order

## Architecture

The system consists of 5 specialized agents:

1. **Task Planner**: Analyzes goals and creates structured task plans
2. **Task Executor**: Executes development tasks (bootstrap, code, test)
3. **Code Reviewer**: Reviews code and provides structured feedback
4. **Context Expander**: Provides additional technical context and insights
5. **Project Bootstrap**: Generates project structures and setup

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

### Full Orchestration Workflow

```typescript
import { Orchestrator } from './orchestrator';

const orchestrator = new Orchestrator({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const result = await orchestrator.orchestrate({
  goal: 'Create a REST API with user authentication',
  constraints: ['Use TypeScript', 'Include tests'],
});

console.log('Tasks:', result.tasks);
console.log('Results:', result.results);
console.log('Review:', result.review);
```

### Using Individual Agents

```typescript
const agents = orchestrator.getAgents();

// Plan tasks
const tasks = await agents.taskPlanner.plan({
  goal: 'Build a todo app',
});

// Execute a task
const result = await agents.taskExecutor.execute(tasks[0]);

// Review code
const review = await agents.codeReviewer.review(code);

// Expand context
const context = await agents.contextExpander.expand(
  'React application',
  'What state management should I use?'
);
```

## Examples

See the `src/examples/` directory for complete examples:

- `basic-usage.ts` - Full orchestration workflow
- `individual-agents.ts` - Using agents independently

Run examples with:
```bash
tsx src/examples/basic-usage.ts
```

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Project Structure

```
ai-dev-orchestrator/
├── src/
│   ├── agents/              # Specialized AI agents
│   │   ├── task-planner/
│   │   ├── task-executor/
│   │   ├── code-review/
│   │   ├── context-expander/
│   │   └── project-bootstrap/
│   ├── contracts/           # Zod schemas for data validation
│   │   └── v1/
│   ├── prompts/            # System prompts for agents
│   │   └── v1/
│   ├── orchestrator/       # Core orchestration logic
│   ├── examples/           # Usage examples
│   └── index.ts            # Main exports
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Contracts

The system uses Zod schemas for type-safe data validation:

### Task Schema
```typescript
{
  id: number;
  description: string;
  type: 'bootstrap' | 'code' | 'test';
  dependencies?: number[];
}
```

### Context Input Schema
```typescript
{
  goal: string;
  constraints?: string[];
}
```

### Review Schema
```typescript
{
  status: 'APPROVED' | 'REWORK' | 'BLOCKED';
  issues: Array<{
    severity: 'low' | 'medium' | 'high';
    file?: string;
    description: string;
  }>;
}
```

## License

MIT © josemarjp

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
