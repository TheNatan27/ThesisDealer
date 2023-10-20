import execa from 'execa';
import dotenv from 'dotenv';
import {logger} from './Logger';

async function createDeployment(
  suiteId: string,
  dockerId: string,
  replicas: number,
  concurrency: number
) {
  dotenv.config();
  const ipAddresss = process.env.IP_ADDRESS!;

  try {
    await execa('docker', [
      'service',
      'create',
      '--env',
      `SUITE_ID=${suiteId}`,
      '--env',
      `IP_ADDRESS=${ipAddresss}`,
      '--name',
      dockerId,
      '--replicas',
      replicas.toString(),
      '--mode',
      'replicated-job',
      '--max-concurrent',
      concurrency.toString(),
      'merninfo/worker-image:latest',
    ]);
  } catch (error) {
    logger.error(error);
    //TODO throw deployment error
  }
}

export {createDeployment};
