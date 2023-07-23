import {TestState} from '../Shared/CustomTypes';

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
  readonly name = 'defname';
  private state = TestState.Done;
  readonly result = "{hello: 'world'}";
  readonly script = 'defscript';
}

export class InitialTestClass implements ITestClass {
  constructor(parameters: Pick<ITestClass, 'name' | 'script'>) {
    Object.assign(this, parameters);
  }
  getState(): TestState {
    return this.state;
  }
  setState(state: TestState) {
    this.state = state;
  }
  readonly name = 'defname';
  private state = TestState.Ready;
  readonly result = 'defresult';
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
  readonly suite_id: string;
  readonly name = 'defname';
  private state = TestState.Done;
  readonly result = 'defresult';
  readonly script = 'defscript';
}

export interface ITestClass {
  name: string;
  result: string;
  script: string;
  getState(): TestState;
  setState(state: TestState): void;
}
