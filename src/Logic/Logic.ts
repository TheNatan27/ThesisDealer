/* eslint-disable @typescript-eslint/no-namespace */
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';
import {createDeployment, removeDeployment} from '../Shared/DockerConnector';
import {TestObjectType, testStateSchema} from '../Shared/TestClassTypes';

export interface ILogic {
  startTestSuite(): Promise<string>;
  reserveTest(suite: string): Promise<string>;
  requestTest(suiteId: string, testId: string): Promise<string>;
  returnTest(result: string, suiteId: string, testId: string): Promise<void>;

  readonly testRunRepository: Array<TestSuiteClass>;
}

/////////////////////////////////////////////

export class Logic implements ILogic {
  readonly testRunRepository: Array<TestSuiteClass>;

  constructor() {
    this.testRunRepository = new Array<TestSuiteClass>();
  }

  // Workflow:
  // 1. startTestSuite creates a new testSuite, then starts the docker deployment with the new suite id
  // 2. docker workers first reserve a testid with the suite id, then download the script with the testid
  // 3. the workers return the result with the suite and test id

  async startTestSuite(): Promise<string> {
    const suiteId = uuid();
    const dockerId = uuid();
    const newTestSuiteClass = new TestSuiteClass(suiteId, dockerId);
    this.testRunRepository.push(newTestSuiteClass);
    await createDeployment(suiteId, dockerId);
    return suiteId;
  }

  async reserveTest(suiteId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    return await selectedSuite.reserveTestId();
  }

  async requestTest(suiteId: string, testId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    return await selectedSuite.drawTest(testId);
  }

  async returnTest(result: string, suiteId: string, testId: string) {
    const selectedSuite = await this.selectTestSuite(suiteId);
    await selectedSuite.returnTest(testId, result);
    await this.checkIfSuiteIsDone(selectedSuite.testSet, suiteId);
  }

  private async checkIfSuiteIsDone(testSet: TestObjectType[], suiteId: string) {
    // If the search finds a test thats state is not done,
    // nothing happens, but if the result is -1 docker deployments should stop
    const notDoneTestIndex = testSet.findIndex(
      test => test.state !== testStateSchema.Enum.Done
    );
    if (notDoneTestIndex === -1) {
      await removeDeployment(suiteId);
    }
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    assert(selectedSuite !== undefined);
    return selectedSuite;
  }
}
