import {InvalidConfigurationError} from '../Errors/InvalidConfigurationError';
import {configurationSchema} from '../Types/ConfigurationSchema';

export function validateEnvironmentVariables() {
  try {
    const postgresConfiguration = configurationSchema.parse(process.env);
    console.log(
      `Postgres configuration: \n ${JSON.stringify(
        postgresConfiguration,
        null,
        3
      )}`
    );
    return postgresConfiguration;
  } catch (error) {
    console.error('Invalid or missing environment variables provided');
    throw new InvalidConfigurationError();
  }
}
