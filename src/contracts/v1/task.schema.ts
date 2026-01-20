import { z } from "zod";

export const TaskSchema = z.object({
  id: z.number(),
  description: z.string(),
  type: z.enum(["bootstrap", "code", "test"]),
  dependencies: z.array(z.number()).optional(),
});
