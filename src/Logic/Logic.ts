/* eslint-disable @typescript-eslint/no-namespace */
import {ITestClass, ReturnedTestClass} from '../Repository/TestClass';
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {PostgresConnector} from '../Shared/PostgresConnector';

export interface ILogic {
  startTestSuite(): string;
  requestTest(guid: string): Promise<ITestClass>;
  returnTest(data: ITestClass, guid: string): Promise<void>;

  readonly testRunRepository: Array<TestSuiteClass>;
}

/////////////////////////////////////////////

export class Logic implements ILogic {
  readonly testRunRepository: Array<TestSuiteClass>;
  readonly postgresConnector: PostgresConnector;

  constructor() {
    this.testRunRepository = new Array<TestSuiteClass>();
    this.postgresConnector = new PostgresConnector();
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
    await selectedSuite.returnTest(testClass, this.postgresConnector);
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
