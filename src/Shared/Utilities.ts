import {Client} from 'ts-postgres';
import {ITestClass, QueryTestClass} from '../Repository/TestClass';

export async function readSuite(uuid: string) {
  const client = new Client({
    user: 'postgres',
    password: 'adminu',
    database: 'Canasta-Results',
  });

  await client.connect();

  try {
    const result = client.query(
      'SELECT name FROM test_results WHERE suite_id = $1',
      [uuid]
    );

    for await (const row of result) {
      console.log(row.data);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function processResults(testClass: ITestClass, uuid: string) {
  console.log('bruh');
  const data = new QueryTestClass({testClass, suiteId: uuid});
}
