/**
 * Complete Orchestration Demo - Always Executes
 */

import 'dotenv/config';
import { Orchestrator } from './src/orchestrator/index.js';
import { ContextInputSchema } from './src/contracts/v1/context.schema.js';
import type { Review } from './src/contracts/v1/review.schema.js';

console.log('🚀 Starting AI Dev Orchestrator - Full Workflow Demo\n');
console.log('='.repeat(70));

(async () => {
  try {
    // Initialize the orchestrator
    const orchestrator = new Orchestrator({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-sonnet-4-20250514',
    });

    // Define development goal
    const context = ContextInputSchema.parse({
      goal: 'Create a simple REST API with user authentication',
      constraints: ['Use TypeScript', 'Include unit tests', 'Follow REST best practices'],
    });

    console.log('\n📋 Starting orchestration...');
    console.log(`🎯 Goal: ${context.goal}`);
    console.log(`📌 Constraints: ${context.constraints?.join(', ')}\n`);

    // Run the full orchestration workflow
    console.log('⏳ Running orchestration (this may take a few minutes)...\n');
    const result = await orchestrator.orchestrate(context);

    // Display results
    console.log('\n' + '='.repeat(70));
    console.log('📊 ORCHESTRATION RESULTS');
    console.log('='.repeat(70));

    console.log('\n📋 PLANNED TASKS:');
    console.log('-'.repeat(70));
    result.tasks.forEach(task => {
      const deps = task.dependencies?.length
        ? ` → depends on [${task.dependencies.join(', ')}]`
        : '';
      console.log(`  [${task.id}] ${task.type.toUpperCase()}: ${task.description}${deps}`);
    });

    console.log('\n\n💻 EXECUTION RESULTS:');
    console.log('-'.repeat(70));
    result.results.forEach((taskResult, index) => {
      console.log(`\n📦 Task ${index + 1} Output:`);
      const output = typeof taskResult === 'object' ? JSON.stringify(taskResult, null, 2) : String(taskResult);
      console.log(output.substring(0, 300) + '...\n');
    });

    console.log('\n🔍 CODE REVIEW:');
    console.log('-'.repeat(70));
    console.log(`\n📊 Status: ${result.review.status}`);
    console.log(`📝 Issues Found: ${result.review.issues.length}\n`);

    if (result.review.issues.length > 0) {
      result.review.issues.forEach((issue: Review['issues'][number], idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        if (issue.file) {
          console.log(`     📄 File: ${issue.file}`);
        }
      });
    } else {
      console.log('  ✨ No issues found - code is perfect!');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ ORCHESTRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Orchestration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
})();
