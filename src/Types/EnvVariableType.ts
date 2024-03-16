import {z} from 'zod';

export const envVariableSchema = z.object({
  DATABASE_HOST: z.string().ip().default('127.0.0.1'),
  POSTGRES_PASSWORD: z.string(),
  IP_ADDRESS: z.string().ip(),
  BACKEND_PORT: z.number().default(30552),
  BACKEND_IP: z.string().ip().optional(),
  LOG_FOLDER: z.string(),
  ROOT_FOLDER: z.string(),
});

export type EnvVariableType = z.infer<typeof envVariableSchema>;
