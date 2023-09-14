class EmptyTestSuiteError extends Error {
  constructor(suiteId: string) {
    super(suiteId);
    this.name = 'EmptyTestSuiteError';
    this.message = `No more tests available in ${suiteId}`;
  }
}

class SuiteNotFoundError extends Error {
  constructor(suiteId: string) {
    super(suiteId);
    this.name = 'SuiteNotFoundError';
    this.message = `${suiteId} does not exist`;
  }
}
