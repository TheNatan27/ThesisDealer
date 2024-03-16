import GlobalConfiguration from '../src/Configuration/Configuration';
import {TestSuiteClass} from '../src/Repository/TestSuiteClass';

describe('Test suite class tests', () => {
  const mockTestSuiteClass = new TestSuiteClass(
    'suiteId',
    'dockerId',
    GlobalConfiguration.getConfiguration().mockFolder
  );

  test('Initialization', () => {
    expect(mockTestSuiteClass.testSet.length).toBe(3);
  });
});
