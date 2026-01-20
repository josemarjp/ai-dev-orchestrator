/**
 * Example of using individual agents directly
 */

import 'dotenv/config';
import { Orchestrator } from '../orchestrator/index.js';
import { ContextInputSchema } from '../contracts/v1/context.schema.js';
import type { Review } from '../contracts/v1/review.schema.js';

async function main() {
  const orchestrator = new Orchestrator({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });

  const agents = orchestrator.getAgents();

  // Example 1: Use Task Planner independently
  console.log('=== TASK PLANNING ===\n');
  const context = ContextInputSchema.parse({
    goal: 'Build a todo list application',
    constraints: ['Use React', 'Add local storage persistence'],
  });

  const tasks = await agents.taskPlanner.plan(context);
  tasks.forEach(task => {
    console.log(`[${task.id}] ${task.description}`);
  });

  // Example 2: Execute a specific task
  console.log('\n=== TASK EXECUTION ===\n');
  const firstTask = tasks[0];
  const result = await agents.taskExecutor.execute(firstTask);
  console.log(result);

  // Example 3: Review some code
  console.log('\n=== CODE REVIEW ===\n');
  const sampleCode = `
function authenticate(username, password) {
  if (username === 'admin' && password === '12345') {
    return true;
  }
  return false;
}
  `;

  const review = await agents.codeReviewer.review(sampleCode, 'Authentication function');
  console.log(`Status: ${review.status}`);
  review.issues.forEach((issue: Review['issues'][number]) => {
    console.log(`[${issue.severity}] ${issue.description}`);
  });

  // Example 4: Expand context
  console.log('\n=== CONTEXT EXPANSION ===\n');
  const expandedContext = await agents.contextExpander.expand(
    'Building a React application',
    'What are the best state management options?'
  );
  console.log(expandedContext);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
