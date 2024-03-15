import {Client} from 'ts-postgres';
import {logger} from './Logger';
import {ConfigurationType} from '../Types/ConfigurationSchema';
import {validateEnvironmentVariables} from '../Configuration/Configuration';

class PostgresConnector {
  private client: Client;
  private isConnected: boolean;
  private configuration: ConfigurationType;

  constructor() {
    this.configuration = validateEnvironmentVariables();
    this.client = new Client({
      user: 'postgres',
      password: this.configuration.postgres_password,
      database: 'postgres',
      host: this.configuration.database_host,
    });
    this.isConnected = false;
  }

  private async connectToDb() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      logger.info('Database connected!');
    }
  }

  async insertTestResult(
    testName: string,
    testId: string,
    suiteId: string,
    resultData: string
  ) {
    this.connectToDb();

    try {
      const result = this.client.query(
        `INSERT INTO result_table VALUES ('${testId}',
        '${suiteId}', 
        '${testName}', 
        '${resultData}');`
      );

      for await (const row of result) {
        logger.info(row);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  async initialize() {
    this.connectToDb();

    try {
      const result = this.client.query(
        'CREATE TABLE suite_table (suite_id UUID PRIMARY KEY, suite_size INTEGER, number_of_vms INTEGER, execution_time INTEGER DEFAULT 0, vm_type VARCHAR(244), concurrency INTEGER);'
      );

      for await (const row of result) {
        logger.info(row);
      }
    } catch (error) {
      logger.error(error);
    }

    try {
      const result = this.client.query(
        'CREATE TABLE result_table (test_id UUID PRIMARY KEY, suite_id UUID, test_name VARCHAR(244), result_data JSON, FOREIGN KEY (suite_id) REFERENCES suite_table (suite_id));'
      );

      for await (const row of result) {
        logger.info(row);
      }
    } catch (error) {
      logger.error(error);
    }
    logger.info('Database initialized!');
  }

  async insertSuite(
    suiteId: string,
    suiteSize: number,
    numberOfVms: number,
    vmType: string,
    concurrency = 999
  ) {
    this.connectToDb();

    logger.info(
      `INSERT INTO "suite_table" ("suite_id", "suite_size", "number_of_vms", "vm_type", "concurrency") VALUES ('${suiteId}', ${suiteSize}, ${numberOfVms}, '${vmType}', ${concurrency});`
    );

    try {
      const result = this.client.query(
        `INSERT INTO "suite_table" ("suite_id", "suite_size", "number_of_vms", "vm_type", "concurrency") VALUES ('${suiteId}', ${suiteSize}, ${numberOfVms}, '${vmType}', ${concurrency})`
      );

      for await (const row of result) {
        logger.info(row);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  async updateExecutionTime(executionTime: number, suiteId: string) {
    this.connectToDb();

    logger.info(
      `UPDATE suite_table SET execution_time = ${executionTime.toString()} WHERE suite_id = '${suiteId}';`
    );

    try {
      const result = this.client.query(
        `UPDATE suite_table SET execution_time = ${executionTime.toString()} WHERE suite_id = '${suiteId}';`
      );

      for await (const row of result) {
        logger.info(row);
      }
    } catch (error) {
      logger.error(error);
    }
  }
}

class GlobalConnection {
  private static _postgresConnector: PostgresConnector;

  private constructor() {}

  static getInstance() {
    if (this._postgresConnector) {
      return this._postgresConnector;
    }

    this._postgresConnector = new PostgresConnector();
    return this._postgresConnector;
  }
}

export default GlobalConnection;
