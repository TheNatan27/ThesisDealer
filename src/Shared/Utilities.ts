import {ITestClass, QueryTestClass} from '../Repository/TestClass';
import PostgresConnector from './PostgresConnector';
import {TestObjectType} from './TestClassTypes';

export async function processResults(completedTest: TestObjectType) {
  await PostgresConnector.getInstance().insertTestResult(completedTest);
}
