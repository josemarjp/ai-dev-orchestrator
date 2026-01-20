import type Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ProjectConfig {
  name: string;
  description: string;
  type: 'web' | 'api' | 'cli' | 'library';
  features?: string[];
  framework?: string;
}

export class ProjectBootstrap {
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

    const promptPath = join(__dirname, '../../prompts/v1/project-bootstrap.md');
    this.systemPrompt = await readFile(promptPath, 'utf-8');
    return this.systemPrompt;
  }

  /**
   * Bootstraps a new project based on configuration
   */
  async bootstrap(config: ProjectConfig): Promise<{
    structure: Record<string, string>;
    instructions: string;
  }> {
    const systemPrompt = await this.loadSystemPrompt();

    const userMessage = `
Project Configuration:
- Name: ${config.name}
- Description: ${config.description}
- Type: ${config.type}
${config.framework ? `- Framework: ${config.framework}` : ''}
${config.features ? `- Features: ${config.features.join(', ')}` : ''}

Please generate a project structure with file contents and setup instructions.
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

    // TODO: Parse structured output for file structure
    return {
      structure: {},
      instructions: content.text,
    };
  }
}
