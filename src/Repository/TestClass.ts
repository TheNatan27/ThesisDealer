import {TestState} from '../Shared/CustomTypes';

export class TestClass {
  readonly name: string;
  private state: TestState;
  private result: string;
  readonly script: string;

  constructor(name: string, script: string) {
    this.name = name;
    this.state = TestState.Ready;
    this.result = 'not finished';
    this.script = script;
  }

  set setState(state: TestState) {
    this.state = state;
  }

  get getState() {
    console.log(this.state);
    return this.state;
  }

  set setResult(result: string) {
    this.result = result;
  }

  get getResult() {
    return this.result;
  }
}
