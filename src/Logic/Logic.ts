/* eslint-disable @typescript-eslint/no-namespace */
import {ITestClass, ReturnedTestClass} from '../Repository/TestClass';
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';

export interface ILogic {
  startTestSuite(): string;
  requestTest(suiteId: string): Promise<ITestClass>;
  returnTest(data: ITestClass, suiteId: string): Promise<void>;

  readonly testRunRepository: Array<TestSuiteClass>;
}

/////////////////////////////////////////////

export class Logic implements ILogic {
  readonly testRunRepository: Array<TestSuiteClass>;

  constructor() {
    this.testRunRepository = new Array<TestSuiteClass>();
  }

  startTestSuite(): string {
    const suiteId = uuid();
    const newTestSuiteClass = new TestSuiteClass(suiteId);
    this.testRunRepository.push(newTestSuiteClass);
    return suiteId;
  }

  async requestTest(suiteId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    return await selectedSuite.drawTest();
  }

  async returnTest(data: ITestClass, suiteId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    const testClass = new ReturnedTestClass(data);
    await selectedSuite.returnTest(testClass);
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    assert(selectedSuite !== undefined);
    return selectedSuite;
  }
}
