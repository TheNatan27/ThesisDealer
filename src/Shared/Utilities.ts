import PostgresConnector from './PostgresConnector';
import {
  InitialTestType,
  ProcessedTestType,
  processedTestSchema,
} from './TestClassTypes';

export async function processResults(
  testClass: InitialTestType,
  result: string,
  uuid: string
) {
  const processedTest: ProcessedTestType = processedTestSchema.parse({
    testClass,
    result: result,
    suite_id: uuid,
  });
  await PostgresConnector.getInstance().insertTestResult(processedTest);
}

// TODO private fuggvany amiben feldolgozzuk a resultot
