import PostgresConnector from '../Postgres/PostgresConnector';
import {TestObjectType} from './TestClassTypes';

export async function processResults(completedTest: TestObjectType) {
  await uploadResult(completedTest);
}

async function uploadResult(processedResult: TestObjectType) {
  // TODO: process the result, but its format is not yet known.
  await PostgresConnector.getInstance().insertTestResult(
    processedResult.name,
    processedResult.test_id,
    processedResult.suite_id,
    processedResult.result!
  );
}
