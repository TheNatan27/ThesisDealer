/* eslint-disable @typescript-eslint/no-namespace */
import {TestSuiteClass} from '../Repository/TestSuiteClass';
import {v4 as uuid} from 'uuid';
import assert from 'assert';
import {createDeployment, removeDeployment} from '../Shared/DockerConnector';
import {TestObjectType, testStateSchema} from '../Shared/CustomTypes';
import GlobalConnection from '../Shared/PostgresConnector';
import {performance} from 'perf_hooks';
import {logger, performanceLogger} from '../Shared/Logger';
import {sleep} from '../Shared/Utilities';

export interface ILogic {
  startTestSuite(
    numberOfVms: number,
    vmType: string,
    concurrency?: number
  ): Promise<string>;
  reserveTest(suite: string): Promise<string>;
  requestTest(suiteId: string, testId: string): Promise<string>;
  returnTest(result: string, suiteId: string, testId: string): Promise<void>;
  runConcurrencyBenchmark(vmType: string): Promise<void>;
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
    numberOfVms: number,
    vmType: string,
    concurrency?: number,
    parallelDeploymentEnabled = true
  ): Promise<string> {
    const suiteId = uuid();
    const dockerId = uuid();
    const newTestSuiteClass = new TestSuiteClass(suiteId, dockerId);
    this.testRunRepository.push(newTestSuiteClass);
    await this.createSuiteInDatabase(
      suiteId,
      dockerId,
      newTestSuiteClass.testSet.length,
      numberOfVms,
      vmType,
      concurrency,
      parallelDeploymentEnabled
    );
    return suiteId;
  }

  private async createSuiteInDatabase(
    suiteId: string,
    dockerId: string,
    suiteSize: number,
    numberOfVms: number,
    vmType: string,
    concurrency?: number,
    parallelDeploymentEnabled = true
  ) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    await GlobalConnection.getInstance().insertSuite(
      suiteId,
      formattedDate,
      suiteSize,
      numberOfVms,
      vmType,
      concurrency
    );
    performanceLogger.warn({suite: suiteId}, 'Deployment started.');
    if (parallelDeploymentEnabled) {
      createDeployment(suiteId, dockerId, suiteSize, concurrency);
    } else {
      await createDeployment(suiteId, dockerId, suiteSize, concurrency);
    }
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
    logger.info(`Returned test - testid: ${testId}, suiteid: ${suiteId}`);
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
      performanceLogger.info({suite: suiteId}, 'Deployment finished.');
      await removeDeployment(dockerId);
    }
  }

  private async printPerformance(startTime: number, suiteId: string) {
    const executionTime = Math.floor((performance.now() - startTime) / 1000);
    logger.info(`Execution time: ${executionTime} seconds`);
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

  async runConcurrencyBenchmark(vmType: string) {
    const configurations = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];

    for await (const configuration of configurations) {
      logger.warn(`Benchmark run started for ${configuration}.`);
      const suiteId = await this.startTestSuite(
        3,
        vmType,
        configuration,
        false
      );
      logger.warn(
        `Benchmark run for ${configuration} finished, Suite id: ${suiteId}.`
      );
      await this.cooldown();
    }
  }

  async cooldown() {
    let counter = 0;
    while (counter < 12) {
      await sleep(10_000);
      logger.warn(`Cooldown...  --- ${(counter + 1) * 10} second(s) passed`);
      counter++;
    }
    logger.warn('Concurrency benchmark done.');
    performanceLogger.warn('Concurrency benchmark done.');
  }
}
