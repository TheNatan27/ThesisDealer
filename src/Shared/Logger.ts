import pino from 'pino';
import path from 'path';
import GlobalConfiguration from '../Configuration/Configuration';

const configuration = GlobalConfiguration.getConfiguration();
const logfolder = path.join(
  configuration.envVariables.LOG_FOLDER,
  'dealer.log'
);
const performanceLogFolder = path.join(
  configuration.envVariables.LOG_FOLDER,
  'performance.log'
);

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
