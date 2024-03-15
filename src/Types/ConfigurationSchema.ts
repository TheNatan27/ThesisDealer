import {z} from 'zod';

export const configurationSchema = z.object({
  database_host: z.string().ip().default('127.0.0.1'),
  postgres_password: z.string(),
  ip_address: z.string().ip(),
  backend_port: z.number().default(30552),
  backend_ip: z.string().ip().optional(),
  log_folder: z.string(),
});

export type ConfigurationType = z.infer<typeof configurationSchema>;
