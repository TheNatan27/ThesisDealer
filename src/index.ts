import {DealerController} from './Endpoint/DealerController';
import {
  InitialTestClass,
  QueryTestClass,
  ReturnedTestClass,
} from './Repository/TestClass';

const controller = new DealerController();
controller.startListening();
