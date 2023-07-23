import {DealerController} from './Endpoint/DealerController';
import {
  InitialTestClass,
  QueryTestClass,
  ReturnedTestClass,
} from './Repository/TestClass';
import {TestState} from './Shared/CustomTypes';
import {PostgresConnector} from './Shared/PostgresConnector';

const pc = new PostgresConnector();
const init = new InitialTestClass({name: 'hello', script: 'world'});
init.setState(TestState.NotRun);
const query = new QueryTestClass({
  testClass: init,
  suiteId: '2ec7c80e-a7b0-495c-95fe-e6dee4ebb28b',
});
pc.insertTestResult(query);

//const controller = new DealerController();
//controller.startListening();
