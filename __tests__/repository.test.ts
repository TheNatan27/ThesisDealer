import path from 'path';
import GlobalConfiguration from '../src/Configuration/Configuration';
import {TestSuiteClass} from '../src/Repository/TestSuiteClass';
import {TestState} from '../src/Types/CustomTypes';

describe('Test suite class tests', () => {
  const mockTestSuiteClass = new TestSuiteClass(
    '910a9021-4971-4306-b8db-df201b0038cd',
    'e095b0db-bfff-440d-b74e-151960ab583f',
    GlobalConfiguration.getConfiguration().mockFolder
  );

  test('Initialization', () => {
    expect(mockTestSuiteClass.testSet.length).toBe(3);
    expect(mockTestSuiteClass.testSet[0].name).toBe('01.spec.ts');
    expect(mockTestSuiteClass.testSet[0].state).toBe('Ready');
    expect(mockTestSuiteClass.testSet[0].suite_id).toBe(
      '910a9021-4971-4306-b8db-df201b0038cd'
    );
    expect(mockTestSuiteClass.testSet[0].test_id).toBeDefined();
    expect(mockTestSuiteClass.suiteId).toBe(
      '910a9021-4971-4306-b8db-df201b0038cd'
    );
    expect(mockTestSuiteClass.dockerId).toBe(
      'e095b0db-bfff-440d-b74e-151960ab583f'
    );
  });

  test('Reservation - positive', async () => {
    const result = await mockTestSuiteClass.reserveTestId();
    expect(result).toBe(mockTestSuiteClass.testSet[0].test_id);
    expect(mockTestSuiteClass.testSet[0].state).toBe('Reserved');
  });

  test('Draw test', async () => {
    const result = await mockTestSuiteClass.drawTest(
      mockTestSuiteClass.testSet[0].test_id
    );
    expect(result).toBe(mockTestSuiteClass.testSet[0].script);
    expect(result).toBe(
      path.join(GlobalConfiguration.getConfiguration().mockFolder, '01.spec.ts')
    );
    expect(mockTestSuiteClass.testSet[0].state).toBe('Started');
  });
});
