import execa from 'execa';
import dotenv from 'dotenv';
import {logger} from './Logger';

async function createDeployment(
  suiteId: string,
  dockerId: string,
  replicas: number
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
      'merninfo/worker-image:latest',
    ]);
  } catch (error) {
    logger.error(error);
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  logger.info(`Remove docker service: ${dockerId}`);
  try {
    const {stdout} = await execa('docker', ['service', 'rm', dockerId]);
    logger.info(stdout);
  } catch (error) {
    logger.error(error);
    //TODO throw remove error
  }
}

export {createDeployment, removeDeployment};
