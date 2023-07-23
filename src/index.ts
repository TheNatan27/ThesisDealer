import {DealerController} from './Endpoint/DealerController';
import {
  InitialTestClass,
  QueryTestClass,
  ReturnedTestClass,
} from './Repository/TestClass';
import {TestState} from './Shared/CustomTypes';


const controller = new DealerController();
controller.startListening();
