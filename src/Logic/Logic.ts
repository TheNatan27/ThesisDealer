/* eslint-disable @typescript-eslint/no-namespace */
import {assert} from 'console';
import {ITestClass, ReturnedTestClass} from '../Repository/TestClass';
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {TestState} from '../Shared/CustomTypes';

export interface ILogic {
  startTestSuite(): string;
  requestTest(guid: string): Promise<ITestClass>;
  returnTest(data: ITestClass, guid: string): Promise<void>;

  readonly testRunRepository: Array<TestSuiteClass>;
}

/////////////////////////////////////////////

export class Logic implements ILogic {
  readonly testRunRepository: Array<TestSuiteClass>;

  constructor() {
    this.testRunRepository = new Array<TestSuiteClass>();
  }

  startTestSuite(): string {
    const newTestSuiteClass = new TestSuiteClass('12345');
    this.testRunRepository.push(newTestSuiteClass);
    return '12345';
  }

  async requestTest(guid: string) {
    const selectedSuite = await this.selectTestSuite(guid);
    return await selectedSuite.drawTest();
  }

  async returnTest(data: ITestClass, guid: string) {
    const selectedSuite = await this.selectTestSuite(guid);
    const testClass = new ReturnedTestClass(data);
    console.log(JSON.stringify(testClass));
    console.log(testClass.getState());
    await selectedSuite.returnTest(testClass);
  }

  private async selectTestSuite(guid: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === guid
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
