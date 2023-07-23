import {ITestClass, QueryTestClass} from '../Repository/TestClass';
import PostgresConnector from './PostgresConnector';

export async function processResults(
  testClass: ITestClass,
  uuid: string
) {
  const data = new QueryTestClass({testClass, suiteId: uuid});
  await PostgresConnector.getInstance().insertTestResult(data);
}
