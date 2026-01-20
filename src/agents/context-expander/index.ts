import type Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ContextExpander {
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

    const promptPath = join(__dirname, '../../prompts/v1/context-expander.md');
    this.systemPrompt = await readFile(promptPath, 'utf-8');
    return this.systemPrompt;
  }

  /**
   * Expands context by gathering additional information
   */
  async expand(initialContext: string, question?: string): Promise<string> {
    const systemPrompt = await this.loadSystemPrompt();

    const userMessage = question
      ? `Initial Context: ${initialContext}\n\nQuestion: ${question}\n\nPlease expand on this context to answer the question.`
      : `Initial Context: ${initialContext}\n\nPlease expand on this context with additional relevant information.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    return content.text;
  }
}
