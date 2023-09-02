import z from 'zod';

export const testStateSchema = z.enum([
  'Ready',
  'Reserved',
  'Started',
  'Done',
  'NotRun',
]);

export const testObjectSchema = z.object({
  name: z.string().endsWith('.spec.ts'),
  result: z.string().nullable().default('default_result'),
  script: z.string(),
  test_id: z.string().uuid(),
  suite_id: z.string().uuid(),
  state: testStateSchema,
});

export type TestObjectType = z.infer<typeof testObjectSchema>;

export type TestState = z.infer<typeof testStateSchema>;
