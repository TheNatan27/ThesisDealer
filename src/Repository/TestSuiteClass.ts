import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {processResults} from '../Shared/Utilities';
import {TestObjectType, testStateSchema} from '../Shared/TestClassTypes';
import {v4 as uuid} from 'uuid';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly dockerId: string;
  readonly testSet: TestObjectType[];

  constructor(suiteId: string, dockerId: string) {
    this.suiteId = suiteId;
    this.dockerId = dockerId;
    this.testSet = this.createTestSet(suiteId);
  }

  async reserveTestId() {
    const testIndex = this.testSet.findIndex(
      test => test.state === testStateSchema.enum.Ready
    );
    // eslint-disable-next-line no-useless-catch
    try {
      assert(testIndex !== -1);
    } catch (error) {
      // throw all test are already reserved
      throw error;
    }
    this.testSet[testIndex].state = testStateSchema.enum.Reserved;
    return this.testSet[testIndex].test_id;
  }

  async drawTest(testId: string) {
    const testIndex = this.testSet.findIndex(test => test.test_id === testId);
    assert(testIndex !== -1);
    this.testSet[testIndex].state = testStateSchema.enum.Started;
    return this.testSet[testIndex].script;
  }

  async returnTest(testId: string, result: string) {
    const testIndex = this.testSet.findIndex(test => test.test_id === testId);
    assert(testIndex !== -1);
    await this.updateCompletedTest(testIndex, result);
  }

  private async updateCompletedTest(testIndex: number, result: string) {
    const completedTest = this.testSet[testIndex];
    completedTest.state = testStateSchema.enum.Done;
    completedTest.result = result;
    this.testSet[testIndex] = completedTest;
    await this.saveToDatabase(completedTest);
  }

  private checkForSuiteCompletion() {}

  private async saveToDatabase(completedTest: TestObjectType) {
    await processResults(completedTest);
  }

  private createTestSet(suiteID: string) {
    const currentFiles = this.gatherTestFiles();
    return currentFiles.map(file => ({
      name: file,
      script: this.readTestFile(file),
      test_id: uuid(),
      state: testStateSchema.enum.Ready,
      result: null,
      suite_id: suiteID,
    }));
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
