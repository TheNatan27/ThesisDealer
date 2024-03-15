import pino from 'pino';
import {validateEnvironmentVariables} from '../Configuration/Configuration';
import path from 'path';

const configuration = validateEnvironmentVariables();
const logfolder = path.join(configuration.log_folder, '\\dealer.log');
const performanceLogFolder = path.join(
  configuration.log_folder,
  '\\performance.log'
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
