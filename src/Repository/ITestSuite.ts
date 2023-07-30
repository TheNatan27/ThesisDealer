import {ProcessedTestType} from '../Shared/TestClassTypes';

export interface ITestSuite {
  suiteId: string;
  testSet: ProcessedTestType[];
}
