import {TestState} from '../Shared/CustomTypes';
import {v4 as uuid} from 'uuid';

export class InitialTestClass implements ITestClass {
  constructor(parameters: Pick<ITestClass, 'name' | 'script'>) {
    Object.assign(this, parameters);
    this.test_id = uuid();
  }
  getState(): TestState {
    return this.state;
  }
  setState(state: TestState) {
    this.state = state;
  }
  readonly test_id: string;
  readonly name = 'defname';
  private state = TestState.Ready;
  readonly result = 'defresult';
  readonly script = 'defscript';
}

export class ReturnedTestClass implements ITestClass {
  constructor(parameters: ITestClass) {
    Object.assign(this, parameters);
    this.state = TestState.Done;
  }
  getState(): TestState {
    return this.state;
  }
  setState(state: TestState) {
    this.state = state;
  }
  readonly test_id = 'defid';
  readonly name = 'defname';
  private state = TestState.Done;
  readonly result = "{hello: 'world'}";
  readonly script = 'defscript';
}

export class QueryTestClass implements ITestClass {
  constructor(parameters: {testClass: ITestClass; suiteId: string}) {
    Object.assign(this, parameters.testClass);
    this.suite_id = parameters.suiteId;
  }
  getState(): TestState {
    return this.state;
  }
  setState(state: TestState) {
    this.state = state;
  }
  readonly test_id = 'defid';
  readonly suite_id: string;
  readonly name = 'defname';
  private state = TestState.Done;
  readonly result = 'defresult';
  readonly script = 'defscript';
}

export class DebugTestClass implements ITestClass {
  name = 'debug.spec.ts';
  result = 'passed';
  script = 'hello script';
  test_id = '12345678-abcd-46d2-aada-g5hjkl1234de';
  suite_id = '00000000-abcd-46d2-pppp-o2hjkl9999de';
  state = TestState.Done;
  getState(): TestState {
    return this.state;
  }
  setState(state: TestState): void {
    this.state = state;
  }
}

export interface ITestClass {
  name: string;
  result: string;
  script: string;
  test_id: string;
  getState(): TestState;
  setState(state: TestState): void;
}
