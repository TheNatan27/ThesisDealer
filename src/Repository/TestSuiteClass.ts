import assert from 'assert';
import {createTestSet, processResults} from '../Shared/Utilities';
import {TestObjectType, testStateSchema} from '../Shared/TestClassTypes';
import {AllTestsReservedError} from '../Errors/CustomErrors';
import {removeDeployment} from '../Shared/DockerConnector';

export class TestSuiteClass {
  readonly suiteId: string;
  readonly dockerId: string;
  readonly testSet: TestObjectType[];

  constructor(suiteId: string, dockerId: string) {
    this.suiteId = suiteId;
    this.dockerId = dockerId;
    this.testSet = createTestSet(suiteId);
  }

  async reserveTestId() {
    const testIndex = this.testSet.findIndex(
      test => test.state === testStateSchema.Enum.Ready
    );
    try {
      assert(testIndex !== -1);
    } catch (error) {
      await removeDeployment(this.suiteId);
      throw new AllTestsReservedError(this.suiteId);
    }
    this.testSet[testIndex].state = testStateSchema.Enum.Reserved;
    return this.testSet[testIndex].test_id;
  }

  async drawTest(testId: string) {
    const testIndex = this.testSet.findIndex(test => test.test_id === testId);
    assert(testIndex !== -1);
    this.testSet[testIndex].state = testStateSchema.Enum.Started;
    return this.testSet[testIndex].script;
  }

  async returnTest(testId: string, result: string) {
    const testIndex = this.testSet.findIndex(test => test.test_id === testId);
    assert(testIndex !== -1);
    await this.updateCompletedTest(testIndex, result);
  }

  private async updateCompletedTest(testIndex: number, result: string) {
    const completedTest = this.testSet[testIndex];
    completedTest.state = testStateSchema.Enum.Done;
    completedTest.result = result;
    this.testSet[testIndex] = completedTest;
    await this.saveToDatabase(completedTest);
  }

  private async saveToDatabase(completedTest: TestObjectType) {
    await processResults(completedTest);
  }
}
