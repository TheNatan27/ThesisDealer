import {DealerController} from './Endpoint/DealerController';

const controller = new DealerController();

function start() {
  controller.startListening();
}

start();

export default start;
