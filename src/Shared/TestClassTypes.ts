import z from 'zod';

export const initialTestSchema = z.object({
  name: z.string(),
  script: z.string(),
  test_id: z.string().uuid(),
  state: z.enum(['ready', 'started', 'done']),
});

export const returnedTestSchema = initialTestSchema.extend({
  result: z.string(),
});

export const processedTestSchema = returnedTestSchema.extend({
  suite_id: z.string().uuid(),
});

export type InitialTestType = z.infer<typeof initialTestSchema>;
export type ReturnedTestType = z.infer<typeof returnedTestSchema>;
export type ProcessedTestType = z.infer<typeof processedTestSchema>;
