import {Client} from 'ts-postgres';

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

  async insertSuite(suiteId: string, date: string) {
    this.connectToDb();

    console.log(`INSERT INTO suite_table VALUES ('${suiteId}');`);

    try {
      const result = this.client.query(
        `INSERT INTO suite_table VALUES ('${suiteId}');`
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
        'CREATE TABLE suite_table (suite_id UUID PRIMARY KEY);'
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
