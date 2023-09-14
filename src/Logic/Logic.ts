/* eslint-disable @typescript-eslint/no-namespace */
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';
import {InitialTestType} from '../Repository/TestClassTypes';
import {log} from '../Shared/Utilities';
import {z} from 'zod';
import {
  dockerCommand,
  startDeployment,
  stopDeployment,
} from '../Docker/DockerConnection';

export interface ILogic {
  startTestSuite(): Promise<string>;
  reserveTest(suiteId: string): Promise<string>;
  returnTest(
    body: {result: string},
    suiteId: string,
    testId: string
  ): Promise<void>;
  drawTest(suiteId: string, testId: string): Promise<string>;
  readonly testRunRepository: Array<TestSuiteClass>;
}

/////////////////////////////////////////////

export class Logic implements ILogic {
  readonly testRunRepository: Array<TestSuiteClass>;

  constructor() {
    this.testRunRepository = new Array<TestSuiteClass>();
  }

  async startTestSuite() {
    const suiteId = uuid();
    const newTestSuiteClass = new TestSuiteClass(suiteId);
    this.testRunRepository.push(newTestSuiteClass);
    log([newTestSuiteClass.suiteId]);
    await startDeployment(suiteId);
    return suiteId;
  }

  async reserveTest(suiteId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    try {
      const testId = selectedSuite.reserveTest();
      return testId;
    } catch (error) {
      const customError = error as EmptyTestSuiteError;
      console.log('Every test is reserved');
      await stopDeployment(suiteId);
      return customError.message;
    }
  }

  async drawTest(suiteId: string, testId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    try {
      const foundTest = selectedSuite.drawTest(testId);
      return foundTest;
    } catch (error) {
      const customError = error as EmptyTestSuiteError;
      return customError.message;
    }
  }

  async returnTest(body: {result: string}, suiteId: string, testId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    await selectedSuite.returnTest(body.result, testId);
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    try {
      assert(selectedSuite !== undefined);
      return selectedSuite;
    } catch (error) {
      throw new SuiteNotFoundError(suiteId);
    }
  }
}
