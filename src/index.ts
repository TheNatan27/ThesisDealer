import {DealerController} from './Endpoint/DealerController';
import {startListening} from './Socket/socketServer';

const controller = new DealerController();

function start() {
  controller.startListening();
  startListening();
}

start();

export default start;
