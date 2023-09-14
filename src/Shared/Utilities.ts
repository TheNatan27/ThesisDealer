import PostgresConnector from '../Postgres/PostgresConnector';
import {
  InitialTestType,
  ProcessedTestType,
  processedTestSchema,
} from '../Repository/TestClassTypes';

export async function processResults(
  testClass: InitialTestType,
  result: string,
  uuid: string
) {
  const processedTest: ProcessedTestType = processedTestSchema.parse({
    name: testClass.name,
    script: testClass.script,
    test_id: testClass.test_id,
    state: 'done',
    result: result,
    suite_id: uuid,
  });
  await PostgresConnector.getInstance().insertTestResult(processedTest);
}

export function log(message: string[] | undefined) {
  if (message) {
    console.log(`Log: ${message.join(' ')}`);
    return;
  }
  console.log(`Log: ${message}`);
}

// TODO private fuggvany amiben feldolgozzuk a resultot
