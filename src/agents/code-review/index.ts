import type Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Review } from '../../contracts/v1/review.schema.js';
import { ReviewSchema } from '../../contracts/v1/review.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CodeReviewer {
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

    const promptPath = join(__dirname, '../../prompts/v1/code-review.md');
    this.systemPrompt = await readFile(promptPath, 'utf-8');
    return this.systemPrompt;
  }

  /**
   * Reviews code and returns structured feedback
   */
  async review(code: string, context?: string): Promise<Review> {
    const systemPrompt = await this.loadSystemPrompt();

    const userMessage = `
${context ? `Context: ${context}\n\n` : ''}Code to review:

\`\`\`
${code}
\`\`\`

Please review this code and provide feedback in JSON format following the Review schema.
`;

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

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const reviewData = JSON.parse(jsonMatch[0]);
    return ReviewSchema.parse(reviewData);
  }
}
