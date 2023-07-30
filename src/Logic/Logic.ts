/* eslint-disable @typescript-eslint/no-namespace */
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';
import {InitialTestType} from '../Shared/TestClassTypes';

export interface ILogic {
  startTestSuite(): string;
  requestTest(suiteId: string): Promise<InitialTestType>;
  returnTest(result: string, suiteId: string, testId: string): Promise<void>;

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
    return selectedSuite.drawTest();
  }

  async returnTest(result: string, suiteId: string, testId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    await selectedSuite.returnTest(result, testId);
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    assert(selectedSuite !== undefined);
    return selectedSuite;
  }
}
