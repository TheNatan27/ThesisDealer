import {ITestClass, QueryTestClass} from '../Repository/TestClass';
import PostgresConnector from './PostgresConnector';

export async function processResults(
  testClass: ITestClass,
  result: string,
  uuid: string
) {
  // TODO parse and process result
  const data = new QueryTestClass({testClass, suiteId: uuid, parsedResult: JSON.stringify(result)});
  await PostgresConnector.getInstance().insertTestResult(data);
}
