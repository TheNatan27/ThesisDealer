import {TestState} from '../Shared/CustomTypes';
import fs from 'fs';
import {ITestClass, InitialTestClass} from './TestClass';
import path from 'path';
import {assert} from 'console';
import {processResults} from '../Shared/Utilities';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly testSet: ITestClass[];

  constructor(suiteId: string) {
    this.suiteId = suiteId;
    this.testSet = this.createTestSet();
  }

  async returnTest(result: string, testId: string) {
    const testIndex = this.findTestIndex({testId});
    try {
      assert(testIndex !== -1, 'index failed');
      await processResults(this.testSet[testIndex], result, this.suiteId);
    } catch (error) {
      console.error(error);
    }
  }

  async drawTest(): Promise<ITestClass> {
    const testIndex = this.findTestIndex({state: TestState.Ready});
    if (testIndex !== -1) {
      this.testSet[testIndex].setState(TestState.Started);
      return this.testSet[testIndex];
    } else {
      throw 'No more tests available';
    }
  }

  private findTestIndex(options: {state?: TestState; name?: string, testId?: string}) {
    if (options.name !== undefined) {
      return this.testSet.findIndex(test => test.name === options.name);
    }
    if (options.state !== undefined) {
      return this.testSet.findIndex(test => test.getState() === options.state);
    }
    if (options.testId !== undefined) {
      return this.testSet.findIndex(test => test.test_id === options.testId);
    }
    throw 'Didnt give filter';
  }

  private createTestSet() {
    const currentFiles = this.gatherTestFiles();
    console.log('TESTS ARE CREATED');
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
