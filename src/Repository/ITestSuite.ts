import {ProcessedTestType} from './TestClassTypes';

export interface ITestSuite {
  suiteId: string;
  testSet: ProcessedTestType[];
}
