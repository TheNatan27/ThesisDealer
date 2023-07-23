import {ITestClass, QueryTestClass} from '../Repository/TestClass';
import {PostgresConnector} from './PostgresConnector';

export async function processResults(
  testClass: ITestClass,
  uuid: string,
  connector: PostgresConnector
) {
  const data = new QueryTestClass({testClass, suiteId: uuid});
  await connector.insertTestResult(data);
}
