import {TestState} from '../Shared/CustomTypes';

export class ReturnedTestClass implements ITestClass {
  constructor(parameters: ITestClass) {
    Object.assign(this, parameters);
    this._state = TestState.Done;
  }
  getState(): TestState {
    return this._state;
  }
  setState(state: TestState) {
    this._state = state;
  }
  readonly name = 'defname';
  private _state = TestState.Done;
  readonly result = 'defresult';
  readonly script = 'defscript';
}

export class InitialTestClass implements ITestClass {
  constructor(parameters: Pick<ITestClass, 'name' | 'script'>) {
    Object.assign(this, parameters);
  }
  getState(): TestState {
    return this._state;
  }
  setState(state: TestState) {
    this._state = state;
  }
  readonly name = 'defname';
  private _state = TestState.Ready;
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
