import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
});
export type Item = z.infer<typeof itemSchema>;
