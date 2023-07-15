/* eslint-disable @typescript-eslint/no-namespace */
import {TestClass} from '../Repository/TestClass';
import {TestSuiteClass} from '../Repository/TestSuiteClass';

export interface ILogic {
  startTestSuite(): string;
  requestTest(guid: string): TestClass;
  returnTest(testClass: TestClass, guid: string): void;

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
  requestTest(guid: string) {
    return this.selectTestSuite(guid).drawTest();
  }
  returnTest(testClass: TestClass, guid: string): void {
    this.selectTestSuite(guid).returnTest(testClass);
  }

  private selectTestSuite(guid: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === guid
    );
    if (selectedSuite) {
      return selectedSuite;
    } else {
      throw 'Wrong guid';
    }
  }
}
