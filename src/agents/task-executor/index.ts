import type Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Task } from '../../contracts/v1/task.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TaskExecutor {
  private client: Anthropic;
  private model: string;
  private systemPrompt: string | null = null;

  constructor(client: Anthropic, model: string = 'claude-sonnet-4-20250514') {
    this.client = client;
    this.model = model;
  }

  /**
   * Loads the system prompt from the prompts directory
   */
  private async loadSystemPrompt(): Promise<string> {
    if (this.systemPrompt) {
      return this.systemPrompt;
    }

    const promptPath = join(__dirname, '../../prompts/v1/task-executor.md');
    this.systemPrompt = await readFile(promptPath, 'utf-8');
    return this.systemPrompt;
  }

  /**
   * Executes a task and returns the result
   */
  async execute(
    task: Task,
    context?: string
  ): Promise<{
    taskId: number;
    result: string;
    artifacts?: unknown[];
  }> {
    const systemPrompt = await this.loadSystemPrompt();

    const userMessage = `
Task ID: ${task.id}
Description: ${task.description}
Type: ${task.type}
${context ? `\nContext from previous tasks:\n${context}` : ''}

Please execute this task and provide the result.
`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    return {
      taskId: task.id,
      result: content.text,
      artifacts: response.content.length > 1 ? response.content.slice(1) : undefined,
    };
  }
}
