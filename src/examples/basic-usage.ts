/**
 * Basic usage example of the AI Dev Orchestrator
 */

import { Orchestrator } from '../orchestrator/index.js';
import { ContextInputSchema } from '../contracts/v1/context.schema.js';
import type { Review } from '../contracts/v1/review.schema.js';

async function main() {
  // Initialize the orchestrator with your API key
  const orchestrator = new Orchestrator({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
  });

  // Define your development goal
  const context = ContextInputSchema.parse({
    goal: 'Create a simple REST API with user authentication',
    constraints: ['Use TypeScript', 'Include unit tests', 'Follow REST best practices'],
  });

  try {
    console.log('Starting orchestration...\n');

    // Run the full orchestration workflow
    const result = await orchestrator.orchestrate(context);

    console.log('=== PLANNED TASKS ===');
    result.tasks.forEach(task => {
      console.log(`[${task.id}] ${task.description} (${task.type})`);
      if (task.dependencies) {
        console.log(`    Dependencies: ${task.dependencies.join(', ')}`);
      }
    });

    console.log('\n=== EXECUTION RESULTS ===');
    result.results.forEach((taskResult, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(JSON.stringify(taskResult, null, 2));
    });

    console.log('\n=== CODE REVIEW ===');
    console.log(`Status: ${result.review.status}`);
    console.log(`Issues found: ${result.review.issues.length}`);
    result.review.issues.forEach((issue: Review['issues'][number]) => {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.description}`);
      if (issue.file) {
        console.log(`    File: ${issue.file}`);
      }
    });
  } catch (error) {
    console.error('Error during orchestration:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
