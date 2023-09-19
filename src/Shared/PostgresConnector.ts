import {Client} from 'ts-postgres';
import dotenv from 'dotenv';

class PostgresConnector {
  private client: Client;
  private isConnected: boolean;

  constructor() {
    dotenv.config();
    this.client = new Client({
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'postgres',
      host: process.env.DATABASE_HOST,
    });
    this.isConnected = false;
  }

  private async connectToDb() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log('CONNECTED!');
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
        console.log(row);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async initialize() {
    this.connectToDb();

    try {
      const result = this.client.query(
        'CREATE TABLE suite_table (suite_id UUID PRIMARY KEY, suite_size INTEGER, number_of_vms INTEGER, replica_number INTEGER, execution_time INTEGER DEFAULT 0, vm_type VARCHAR(244));'
      );

      for await (const row of result) {
        console.log(row);
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const result = this.client.query(
        'CREATE TABLE result_table (test_id UUID PRIMARY KEY, suite_id UUID, test_name VARCHAR(244), result_data JSON, FOREIGN KEY (suite_id) REFERENCES suite_table (suite_id));'
      );

      for await (const row of result) {
        console.log(row);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async insertSuite(
    suiteId: string,
    date: string,
    suiteSize: number,
    numberOfVms: number,
    replicaNumber: number,
    vmType: string
  ) {
    this.connectToDb();

    console.log(
      `INSERT INTO suite_table VALUES ('${suiteId}', ${suiteSize}, ${numberOfVms}, ${replicaNumber}, ${0}, ${vmType});`
    );

    try {
      const result = this.client.query(
        `INSERT INTO suite_table VALUES ('${suiteId}', ${suiteSize}, ${numberOfVms}, ${replicaNumber}, ${0}, ${vmType});`
      );

      for await (const row of result) {
        console.log(row);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async updateExecutionTime(executionTime: number, suiteId: string) {
    this.connectToDb();

    console.log(
      `UPDATE suite_table SET execution_time = ${executionTime.toString()} WHERE suite_id = ${suiteId};`
    );

    try {
      const result = this.client.query(
        `UPDATE suite_table SET execution_time = ${executionTime.toString()} WHERE suite_id = ${suiteId};`
      );

      for await (const row of result) {
        console.log(row);
      }
    } catch (error) {
      console.error(error);
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
