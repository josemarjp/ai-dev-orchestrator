import { z } from 'zod';

export const ReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REWORK', 'BLOCKED']),
  issues: z.array(
    z.object({
      severity: z.enum(['low', 'medium', 'high']),
      file: z.string().optional(),
      description: z.string(),
    })
  ),
});

export type Review = z.infer<typeof ReviewSchema>;
