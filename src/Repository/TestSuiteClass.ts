import {TestState} from '../Shared/CustomTypes';
import fs from 'fs';
import {ITestClass, InitialTestClass} from './TestClass';
import path from 'path';
import assert from 'assert';
import {processResults} from '../Shared/Utilities';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly testSet: ITestClass[];

  constructor(suiteId: string) {
    this.suiteId = suiteId;
    this.testSet = this.createTestSet();
  }

  async returnTest(testClass: ITestClass) {
    const foundTest = this.testSet.find(test => test.name === testClass.name);
    assert(foundTest !== undefined);
    assert(foundTest.getState() === TestState.Done);
    this.saveToDatabase(testClass);
  }

  async drawTest() {
    const foundTest = this.testSet.find(
      test => test.getState() === TestState.Done
    );
    assert(foundTest !== undefined);
    return foundTest;
  }

  private async saveToDatabase(testClass: ITestClass) {
    await processResults(testClass, this.suiteId);
  }

  private createTestSet() {
    const currentFiles = this.gatherTestFiles();
    return currentFiles.map(
      file =>
        new InitialTestClass({name: file, script: this.readTestFile(file)})
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
