import GlobalConfiguration from './Configuration/Configuration';
import {DealerController} from './Endpoint/DealerController';
import {startListening} from './Socket/socketServer';

const controller = new DealerController();
function start() {
  const configuration = GlobalConfiguration.getConfiguration();
  controller.startListening();
  startListening();
}

start();

export default start;
