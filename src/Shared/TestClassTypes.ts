import z from 'zod';

export const testClassSchema = z.object({
  name: z.string(),
  result: z.string(),
  script: z.string(),
  test_id: z.string(),
  suite_id: z.string(),
});
