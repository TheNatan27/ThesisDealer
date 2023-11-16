import {DealerController} from './Endpoint/DealerController';
import {SockerConnetion} from './Socket/SocketConnection';

const controller = new DealerController();
const frontend = new SockerConnetion();

function start() {
  controller.startListening();
  frontend.startListening();
}

start();

export default start;
