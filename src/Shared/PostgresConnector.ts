import {Client} from 'ts-postgres';
import {TestObjectType} from './TestClassTypes';

class PostgresConnector {
  private client: Client;
  private isConnected: boolean;

  constructor() {
    this.client = new Client({
      user: 'postgres',
      password: 'adminu',
      database: 'postgres',
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

    console.log(`Insert data: ${testName} -> ${testId}`);

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
