import {TestSuiteClass} from '../Repository/TestSuiteClass';

export interface LogicInterface {
  startTestSuite(
    numberOfVms: number,
    vmType: string,
    concurrency?: number
  ): Promise<string>;
  reserveTest(suite: string): Promise<string>;
  requestTest(suiteId: string, testId: string): Promise<string>;
  returnTest(result: string, suiteId: string, testId: string): Promise<void>;
  readonly testRunRepository: Array<TestSuiteClass>;
}
