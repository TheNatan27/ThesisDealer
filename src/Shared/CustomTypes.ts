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

export const serviceInformationSchemaStrict = z.object({
  ID: z.string(),
  Image: z.string(),
  Mode: z.string(),
  Name: z.string(),
  Ports: z.string(),
  Replicas: z.string().regex(/0\/[0-9]+ \([0-9]+\/[0-9]+ completed\)/i),
});

export const serviceInformationSchema = z.object({
  ID: z.string(),
  Image: z.string(),
  Mode: z.string(),
  Name: z.string(),
  Ports: z.string(),
  Replicas: z.string(),
});

export type TestObjectType = z.infer<typeof testObjectSchema>;

export type TestState = z.infer<typeof testStateSchema>;

export type ServiceInformationStrict = z.infer<
  typeof serviceInformationSchemaStrict
>;

export type ServiceInformationSchema = z.infer<typeof serviceInformationSchema>;

export type DeploymentStatus = {
  doneReplicas: number;
  allReplicas: number;
  isDone: boolean;
};
