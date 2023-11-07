import pino, {destination} from 'pino';
import dotenv from 'dotenv';

dotenv.config();
const logfolder = process.env.LOG_FOLDER || `${__dirname}\\dealer.log`;
const performanceLogFolder =
  process.env.PERFORMANCE_FOLDER || `${__dirname}\\performance.log`;

const fileTransport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'debug',
      options: {},
    },
    {
      target: 'pino/file',
      level: 'debug',
      options: {destination: logfolder},
    },
  ],
});

const performanceFile = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: 'info',
      options: {destination: performanceLogFolder},
    },
  ],
});

const logger = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileTransport
);

const performanceLogger = pino(
  {
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  performanceFile
);

export {logger, performanceLogger};
