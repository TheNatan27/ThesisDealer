import {Client} from 'ts-postgres';
import {QueryTestClass} from '../Repository/TestClass';

export class PostgresConnector {
  private client: Client;
  private isConnected: boolean;

  constructor() {
    this.client = new Client({
      user: 'postgres',
      password: 'adminu',
      database: 'Canasta-Results',
    });
    this.isConnected = false;
  }

  private async connectToDb() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async insertTestResult(data: QueryTestClass) {
    this.connectToDb();

    console.log(JSON.stringify(data));

    try {
      const result = this.client.query(
        'INSERT INTO test_results VALUES $1 $2 $3 $4',
        [[data.name, data.result, data.getState(), data.suite_id]]
      );

      for await (const row of result) {
        console.log(row);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
