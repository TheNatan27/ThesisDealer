/* eslint-disable @typescript-eslint/no-namespace */
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';
import {createDeployment, removeDeployment} from '../Shared/DockerConnector';
import {TestObjectType, testStateSchema} from '../Shared/TestClassTypes';
import GlobalConnection from '../Shared/PostgresConnector';
import {performance} from 'perf_hooks';

export interface ILogic {
  startTestSuite(
    suiteSize: number,
    numberOfVms: number,
    vmType: string
  ): Promise<string>;
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

  async startTestSuite(
    suiteSize: number,
    numberOfVms: number,
    vmType: string
  ): Promise<string> {
    const suiteId = uuid();
    const dockerId = uuid();
    const newTestSuiteClass = new TestSuiteClass(suiteId, dockerId);
    this.testRunRepository.push(newTestSuiteClass);
    await this.createSuiteInDatabase(
      suiteId,
      dockerId,
      newTestSuiteClass.testSet.length,
      suiteSize,
      numberOfVms,
      vmType
    );
    return suiteId;
  }

  private async createSuiteInDatabase(
    suiteId: string,
    dockerId: string,
    replicas: number,
    suiteSize: number,
    numberOfVms: number,
    vmType: string
  ) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    await GlobalConnection.getInstance().insertSuite(
      suiteId,
      formattedDate,
      suiteSize,
      numberOfVms,
      replicas,
      vmType
    );
    createDeployment(suiteId, dockerId, replicas);
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
    console.log(`Returned test - testid: ${testId}, suiteid: ${suiteId}`);
    const selectedSuite = await this.selectTestSuite(suiteId);
    await selectedSuite.returnTest(testId, result);
    await this.checkIfSuiteIsDone(
      selectedSuite.testSet,
      selectedSuite.dockerId,
      selectedSuite.startTime,
      suiteId
    );
  }

  private async checkIfSuiteIsDone(
    testSet: TestObjectType[],
    dockerId: string,
    startTime: number,
    suiteId: string
  ) {
    // If the search finds a test thats state is not done,
    // nothing happens, but if the result is -1 docker deployments should stop
    const notDoneTestIndex = testSet.findIndex(
      test => test.state !== testStateSchema.Enum.Done
    );
    if (notDoneTestIndex === -1) {
      this.printPerformance(startTime, suiteId);
      await removeDeployment(dockerId);
    }
  }

  private async printPerformance(startTime: number, suiteId: string) {
    const executionTime = Math.floor((performance.now() - startTime) / 1000);
    console.log(`Execution time: ${executionTime} seconds`);
    await GlobalConnection.getInstance().updateExecutionTime(
      executionTime,
      suiteId
    );
  }

  private async selectTestSuite(suiteId: string) {
    const selectedSuite = this.testRunRepository.find(
      suite => suite.suiteId === suiteId
    );
    assert(selectedSuite !== undefined);
    return selectedSuite;
  }
}
