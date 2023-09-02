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
