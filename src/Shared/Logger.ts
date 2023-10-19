import pino, {destination} from 'pino';
import dotenv from 'dotenv';

dotenv.config();
const logfolder = process.env.LOG_FOLDER || `${__dirname}\\dealer.log`;

const fileTransport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'info',
      options: {},
    },
    {
      target: 'pino/file',
      level: 'info',
      options: {destination: logfolder},
    },
  ],
});

const logger = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileTransport
);

export {logger};
