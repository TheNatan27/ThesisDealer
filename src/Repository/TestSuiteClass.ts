import {TestState} from '../Shared/CustomTypes';
import fs from 'fs';
import {TestClass} from './TestClass';
import path from 'path';
import {assert} from 'console';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly testSet: TestClass[];

  constructor(suiteId: string) {
    this.suiteId = suiteId;
    this.testSet = this.createTestSet();
  }

  returnTest(testClass: TestClass) {
    const testIndex = this.findTestIndex({name: testClass.name});
    if (testIndex !== -1) {
      try {
        assert(testClass.getState === TestState.Started);
      } catch (error) {
        console.error(error);
      }
      this.testSet[testIndex].setState = TestState.Done;
      this.saveToDatabase(testClass);
    } else {
      throw 'Test does not exits';
    }
  }

  saveToDatabase(testClass: TestClass) {
    console.log(testClass.name + ' saved!');
  }

  drawTest() {
    const testIndex = this.findTestIndex({state: TestState.Ready});
    if (testIndex !== -1) {
      this.testSet[testIndex].setState = TestState.Started;
      return this.testSet[testIndex];
    } else {
      throw 'No more tests available';
    }
  }

  findTestIndex(options: {state?: TestState; name?: string}) {
    if (options.name !== undefined) {
      return this.testSet.findIndex(test => test.name === options.name);
    }
    if (options.state !== undefined) {
      return this.testSet.findIndex(test => test.getState === options.state);
    }
    throw 'Didnt give filter';
  }

  private createTestSet() {
    const currentFiles = this.gatherTestFiles();
    console.log('TESTS ARE CREATED');
    return currentFiles.map(
      file => new TestClass(file, this.readTestFile(file))
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
