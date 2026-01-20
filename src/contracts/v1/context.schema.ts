import { z } from 'zod';

export const ContextInputSchema = z.object({
  goal: z.string(),
  constraints: z.array(z.string()).optional(),
});

export type ContextInput = z.infer<typeof ContextInputSchema>;
