import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {v4 as uuid} from 'uuid';
import {processResults} from '../Shared/Utilities';
import {InitialTestSchema, InitialTestType} from './TestClassTypes';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly testSet: Array<InitialTestType>;

  constructor(suiteId: string) {
    this.suiteId = suiteId;
    this.testSet = this.createTestSet();
  }

  async returnTest(result: string, testId: string) {
    const foundTest = this.testSet.find(test => test.test_id === testId);
    assert(foundTest !== undefined);
    this.saveToDatabase(foundTest, result);
  }

  reserveTest() {
    const foundTest = this.testSet.find(test => test.state === 'ready');
    try {
      assert(foundTest !== undefined);
      foundTest.state = 'reserved';
      return foundTest.test_id;
    } catch (error) {
      throw new EmptyTestSuiteError(this.suiteId);
    }
  }
  drawTest(testId: string) {
    const foundTest = this.testSet.find(test => test.test_id === testId);
    try {
      assert(foundTest !== undefined);
      foundTest.state = 'started';
      return foundTest.script;
    } catch (error) {
      throw new EmptyTestSuiteError(this.suiteId);
    }
  }

  private async saveToDatabase(testClass: InitialTestType, result: string) {
    await processResults(testClass, result, this.suiteId);
  }

  private createTestSet() {
    const currentFiles = this.gatherTestFiles();
    return currentFiles.map(file =>
      InitialTestSchema.parse({
        name: file,
        script: this.readTestFile(file),
        test_id: uuid(),
        state: 'ready',
      })
    );
  }

  private gatherTestFiles() {
    return fs.readdirSync(path.join(__dirname, '../../testfile-storage'));
  }

  private readTestFile(fileName: string) {
    try {
      const data = path.join(__dirname, `../../testfile-storage/${fileName}`);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
