import {Client} from 'ts-postgres';
import {QueryTestClass} from '../Repository/TestClass';

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

  async insertTestResult(data: QueryTestClass) {
    this.connectToDb();

    console.log(`Insert data: ${data.name} -> ${data.test_id}`);

    try {
      const result = this.client.query(
        `INSERT INTO result_table VALUES ('${data.test_id}', '${data.suite_id}', '${data.name}', '${data.result.toString()}');`
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
