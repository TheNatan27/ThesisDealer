export type TestObject = {
  name: string;
  state: TestState;
  result?: string;
};

export enum TestState {
  Ready,
  Started,
  Done,
  NotRun,
}
