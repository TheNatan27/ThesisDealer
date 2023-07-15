import {DealerController} from './Endpoint/DealerController';

console.log('index works');

const controller = new DealerController();
controller.startListening();
