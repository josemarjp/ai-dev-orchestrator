/**
 * Demo with Logging: AI Dev Orchestrator
 * Saves results to a log file for easy viewing
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { Orchestrator } from './src/orchestrator/index.js';
import { ContextInputSchema } from './src/contracts/v1/context.schema.js';

async function runDemo() {
  const logLines: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logLines.push(message);
  };

  log('🤖 AI Dev Orchestrator - Live Demo with Logging\n');
  log('='.repeat(60));

  const orchestrator = new Orchestrator({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
  });

  const context = ContextInputSchema.parse({
    goal: 'Create a simple to-do list function in TypeScript',
    constraints: ['Support add, remove, and list operations', 'Include validation'],
  });

  try {
    log('\n📋 DEMO: Task Planning & Execution');
    log('-'.repeat(60));
    log(`\n🎯 Goal: ${context.goal}`);
    log(`📌 Constraints: ${context.constraints?.join(', ')}`);
    log('\n⏳ Planning tasks with AI...\n');

    const agents = orchestrator.getAgents();
    const tasks = await agents.taskPlanner.plan(context);

    log('✅ Tasks planned successfully!\n');
    tasks.forEach(task => {
      const deps = task.dependencies?.length
        ? ` (depends on: ${task.dependencies.join(', ')})`
        : '';
      log(`  [${task.id}] ${task.type.toUpperCase()}: ${task.description}${deps}`);
    });

    // Execute first task
    if (tasks.length > 0) {
      const firstTask = tasks[0];
      log(`\n\n⏳ Executing Task #${firstTask.id}...\n`);

      const result = await agents.taskExecutor.execute(firstTask);
      log('✅ Task executed successfully!\n');
      log('📄 Result Preview:');
      log('-'.repeat(60));
      const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      log(resultStr.substring(0, 500) + '...\n');

      // Review
      log('\n🔍 Code Review...\n');
      const review = await agents.codeReviewer.review(
        resultStr,
        'TypeScript to-do list implementation'
      );

      log(`📊 Status: ${review.status}`);
      log(`📝 Issues found: ${review.issues.length}\n`);

      if (review.issues.length > 0) {
        review.issues.slice(0, 5).forEach((issue, idx) => {
          log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        });
        if (review.issues.length > 5) {
          log(`  ... and ${review.issues.length - 5} more issues`);
        }
      }
    }

    log('\n\n' + '='.repeat(60));
    log('🎉 Demo completed!');
    log('='.repeat(60));

    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `demo-result-${timestamp}.txt`;
    writeFileSync(filename, logLines.join('\n'));

    log(`\n📝 Results saved to: ${filename}`);

  } catch (error) {
    const errorMsg = `\n❌ Demo failed: ${error}`;
    log(errorMsg);
    writeFileSync('demo-error.txt', logLines.join('\n') + '\n' + errorMsg);
    process.exit(1);
  }
}

runDemo();
