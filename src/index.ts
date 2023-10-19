import {DealerController} from './Endpoint/DealerController';
import {logger} from './Shared/Logger';

const controller = new DealerController();

function start() {
  logger.info('hello start');
  controller.startListening();
}

start();

export default start;
