export class InvalidConfigurationError extends Error {
  constructor() {
    super();
    this.message = 'Invalid or missing environment variables provided';
    this.name = 'InvalidConfigurationError';
  }
}
