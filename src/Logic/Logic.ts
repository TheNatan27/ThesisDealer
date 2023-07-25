/* eslint-disable @typescript-eslint/no-namespace */
import {ITestClass, ReturnedTestClass} from '../Repository/TestClass';
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import GlobalConnection from '../Shared/PostgresConnector';
import {v4 as uuid} from 'uuid'

export interface ILogic {
  startTestSuite(): string;
  requestTest(suiteId: string): Promise<ITestClass>;
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
    return await selectedSuite.drawTest();
  }

  async returnTest(result: string, suiteId: string, testId: string) {
    await (await this.selectTestSuite(suiteId)).returnTest(result, testId);
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    return this.undefinedCheck(selectedSuite);
  }

  undefinedCheck<T>(
    argument: T | undefined | null,
    message = 'Undefined result'
  ) {
    if (argument === undefined || argument === null) {
      throw new TypeError(message);
    }
    return argument;
  }
}
