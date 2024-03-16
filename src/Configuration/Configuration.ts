import path from 'path';
import {EnvVariableType, envVariableSchema} from '../Types/EnvVariableType';
import 'dotenv/config';

class Configuration {
  envVariables: EnvVariableType;

  rootFolder: string;
  srcFolder: string;
  mockFolder: string;
  testfileStorageFolder: string;

  constructor() {
    this.envVariables = this.validateEnvironmentVariables();
    this.rootFolder = path.join(this.envVariables.ROOT_FOLDER);
    this.srcFolder = path.join(this.rootFolder, 'src');
    this.mockFolder = path.join(this.rootFolder, 'mock');
    this.testfileStorageFolder = path.join(this.rootFolder, 'testfile-storage');
    console.log(
      `Paths: \n ${JSON.stringify(
        {
          root: this.rootFolder,
          src: this.srcFolder,
          mock: this.mockFolder,
          storage: this.testfileStorageFolder,
        },
        null,
        3
      )}`
    );
  }
  private validateEnvironmentVariables() {
    const envVariables = envVariableSchema.parse(process.env);
    console.log(
      `Environment variables: \n ${JSON.stringify(envVariables, null, 3)}`
    );
    return envVariables;
  }
}

class GlobalConfiguration {
  private static _configuration: Configuration;
  private constructor() {}

  static getConfiguration() {
    if (this._configuration) {
      return this._configuration;
    }
    this._configuration = new Configuration();
    return this._configuration;
  }
}

export default GlobalConfiguration;
