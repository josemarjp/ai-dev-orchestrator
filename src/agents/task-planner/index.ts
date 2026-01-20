import type Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ContextInput } from '../../contracts/v1/context.schema.js';
import type { Task } from '../../contracts/v1/task.schema.js';
import { TaskSchema } from '../../contracts/v1/task.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TaskPlanner {
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

    const promptPath = join(__dirname, '../../prompts/v1/task-planner.md');
    this.systemPrompt = await readFile(promptPath, 'utf-8');
    return this.systemPrompt;
  }

  /**
   * Plans tasks based on the provided context
   */
  async plan(context: ContextInput): Promise<Task[]> {
    const systemPrompt = await this.loadSystemPrompt();

    const userMessage = `
Goal: ${context.goal}
${context.constraints ? `Constraints: ${context.constraints.join(', ')}` : ''}

Please analyze this goal and break it down into a structured list of tasks.
Return the tasks as a JSON array following the Task schema.
`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    // Parse tasks from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const tasksData = JSON.parse(jsonMatch[0]);
    const tasks = tasksData.map((task: unknown) => TaskSchema.parse(task));

    return tasks;
  }
}
