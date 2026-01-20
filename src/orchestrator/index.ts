import Anthropic from '@anthropic-ai/sdk';
import type { ContextInput } from '../contracts/v1/context.schema.js';
import type { Task } from '../contracts/v1/task.schema.js';
import type { Review } from '../contracts/v1/review.schema.js';
import { TaskPlanner } from '../agents/task-planner/index.js';
import { TaskExecutor } from '../agents/task-executor/index.js';
import { CodeReviewer } from '../agents/code-review/index.js';
import { ContextExpander } from '../agents/context-expander/index.js';

export interface OrchestratorConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export class Orchestrator {
  private client: Anthropic;
  private model: string;
  private taskPlanner: TaskPlanner;
  private taskExecutor: TaskExecutor;
  private codeReviewer: CodeReviewer;
  private contextExpander: ContextExpander;

  constructor(config: OrchestratorConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || 'claude-sonnet-4-20250514';

    // Initialize agents
    this.taskPlanner = new TaskPlanner(this.client, this.model);
    this.taskExecutor = new TaskExecutor(this.client, this.model);
    this.codeReviewer = new CodeReviewer(this.client, this.model);
    this.contextExpander = new ContextExpander(this.client, this.model);
  }

  /**
   * Orchestrates the full development workflow
   */
  async orchestrate(context: ContextInput): Promise<{
    tasks: Task[];
    results: unknown[];
    review: Review;
  }> {
    // 1. Plan tasks
    const tasks = await this.planTasks(context);

    // 2. Execute tasks in dependency order
    const results: unknown[] = [];
    const completedTasks = new Set<number>();
    const taskResults = new Map<number, unknown>();

    while (completedTasks.size < tasks.length) {
      // Find tasks that can be executed (dependencies met)
      const executableTasks = tasks.filter(
        task =>
          !completedTasks.has(task.id) &&
          (!task.dependencies || task.dependencies.every((dep: number) => completedTasks.has(dep)))
      );

      if (executableTasks.length === 0) {
        throw new Error('Circular dependency detected or no executable tasks');
      }

      // Execute tasks in parallel if possible
      const executionPromises = executableTasks.map(async task => {
        // Build context from completed dependencies
        let taskContext = '';
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencyResults = task.dependencies
            .map((depId: number) => {
              const result = taskResults.get(depId);
              return result ? `Task ${depId} result:\n${JSON.stringify(result, null, 2)}` : '';
            })
            .filter(Boolean)
            .join('\n\n');

          taskContext = dependencyResults;
        }

        const result = await this.executeTask(task, taskContext);
        taskResults.set(task.id, result);
        completedTasks.add(task.id);
        results.push(result);
        return result;
      });

      await Promise.all(executionPromises);
    }

    // 3. Review results (combine all code output)
    const allCode = results
      .map(r => (typeof r === 'object' && r !== null ? JSON.stringify(r, null, 2) : String(r)))
      .join('\n\n');

    const review = await this.reviewCode(allCode);

    // 4. Return complete workflow result
    return {
      tasks,
      results,
      review,
    };
  }

  /**
   * Plans tasks based on context
   */
  async planTasks(context: ContextInput): Promise<Task[]> {
    return await this.taskPlanner.plan(context);
  }

  /**
   * Executes a single task
   */
  async executeTask(task: Task, context?: string): Promise<unknown> {
    return await this.taskExecutor.execute(task, context);
  }

  /**
   * Reviews code/results
   */
  async reviewCode(code: string, context?: string): Promise<Review> {
    return await this.codeReviewer.review(code, context);
  }

  /**
   * Expands context with additional information
   */
  async expandContext(initialContext: string, question?: string): Promise<string> {
    return await this.contextExpander.expand(initialContext, question);
  }

  /**
   * Gets the Anthropic client instance
   */
  getClient(): Anthropic {
    return this.client;
  }

  /**
   * Gets access to individual agents
   */
  getAgents() {
    return {
      taskPlanner: this.taskPlanner,
      taskExecutor: this.taskExecutor,
      codeReviewer: this.codeReviewer,
      contextExpander: this.contextExpander,
    };
  }
}
