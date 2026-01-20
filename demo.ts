/**
 * Demo: AI Dev Orchestrator in Action
 * This demonstrates the orchestrator planning and executing a simple task
 */

import 'dotenv/config';
import { Orchestrator } from './src/orchestrator/index.js';
import { ContextInputSchema } from './src/contracts/v1/context.schema.js';

async function runDemo() {
  console.log('🤖 AI Dev Orchestrator - Live Demo\n');
  console.log('='.repeat(60));

  // Initialize orchestrator
  const orchestrator = new Orchestrator({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
  });

  // Demo 1: Simple Task Planning
  console.log('\n📋 DEMO 1: Task Planning');
  console.log('-'.repeat(60));

  const context = ContextInputSchema.parse({
    goal: 'Create a simple calculator function in TypeScript',
    constraints: ['Support basic operations: add, subtract, multiply, divide'],
  });

  try {
    console.log('\n🎯 Goal:', context.goal);
    console.log('📌 Constraints:', context.constraints?.join(', '));

    console.log('\n⏳ Planning tasks with AI...\n');

    const agents = orchestrator.getAgents();
    const tasks = await agents.taskPlanner.plan(context);

    console.log('✅ Tasks planned successfully!\n');
    tasks.forEach(task => {
      const deps = task.dependencies?.length
        ? ` (depends on: ${task.dependencies.join(', ')})`
        : '';
      console.log(`  [${task.id}] ${task.type.toUpperCase()}: ${task.description}${deps}`);
    });

    // Demo 2: Execute First Task
    if (tasks.length > 0) {
      console.log('\n\n💻 DEMO 2: Task Execution');
      console.log('-'.repeat(60));

      const firstTask = tasks[0];
      console.log(`\n⏳ Executing Task #${firstTask.id}: ${firstTask.description}\n`);

      const result = await agents.taskExecutor.execute(firstTask);
      console.log('✅ Task executed successfully!\n');
      console.log('📄 Result:');
      console.log('-'.repeat(60));
      console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
      console.log('-'.repeat(60));

      // Demo 3: Code Review (if result contains code)
      if (result && typeof result === 'object' && 'result' in result) {
        console.log('\n\n🔍 DEMO 3: Code Review');
        console.log('-'.repeat(60));

        const codeToReview = String((result as { result: string }).result);
        console.log('\n⏳ Reviewing generated code...\n');

        const review = await agents.codeReviewer.review(
          codeToReview,
          'TypeScript calculator function'
        );

        console.log('✅ Code review completed!\n');
        console.log(`📊 Status: ${review.status}`);
        console.log(`📝 Issues found: ${review.issues.length}\n`);

        if (review.issues.length > 0) {
          review.issues.forEach((issue, idx) => {
            console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
            if (issue.file) {
              console.log(`     File: ${issue.file}`);
            }
          });
        } else {
          console.log('  ✨ No issues found - code looks great!');
        }
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 Demo completed successfully!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

// Run demo
runDemo();
