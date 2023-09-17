export {AllTestsReservedError, debugError};

class AllTestsReservedError extends Error {
  readonly suiteId: string;
  constructor(suiteId: string) {
    super();
    this.suiteId = suiteId;
    this.name = 'AllTestsReservedError';
    this.message = `Every test id is already reserved. Suite id: ${suiteId}`;
  }
}

async function debugError() {
  throw new AllTestsReservedError('debug 12345 proba');
}

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
