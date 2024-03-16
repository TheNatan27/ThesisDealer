import {TestObjectType, testStateSchema} from '../Types/CustomTypes';
import fs from 'fs';
import path from 'path';
import {v4 as uuid} from 'uuid';
import PostgresConnector from './PostgresConnector';
import {logger} from './Logger';

export async function processResults(completedTest: TestObjectType) {
  await uploadResult(completedTest);
}

async function uploadResult(processedResult: TestObjectType) {
  // TODO: process the result, but its format is not yet known.
  await PostgresConnector.getInstance().insertTestResult(
    processedResult.name,
    processedResult.test_id,
    processedResult.suite_id,
    JSON.stringify(processedResult.result!)
  );
}

export function createTestSet(suiteID: string, currentFiles: string[]) {
  return currentFiles.map(
    file =>
      ({
        name: file,
        script: readTestFile(file),
        test_id: uuid(),
        state: testStateSchema.Enum.Ready,
        result: null,
        suite_id: suiteID,
      } as TestObjectType)
  );
}

export function gatherTestFiles(fileStorageFolder: string) {
  console.log(fileStorageFolder);
  return fs.readdirSync(fileStorageFolder);
}

function readTestFile(fileName: string) {
  try {
    const data = path.join(__dirname, `../../testfile-storage/${fileName}`);
    return data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
