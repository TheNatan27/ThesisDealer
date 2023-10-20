import execa from 'execa';
import dotenv from 'dotenv';
import {logger} from './Logger';
import assert from 'assert';
import {serviceInformationSchema} from './CustomTypes';
import z from 'zod';

async function createDeployment(
  suiteId: string,
  dockerId: string,
  suiteSize: number,
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
      suiteSize.toString(),
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

async function removeDeployment(dockerId: string) {
  let zeroReplicasRemain = false;
  let counter = 0;
  while (zeroReplicasRemain && counter < 30) {
    zeroReplicasRemain = await parseServiceInformation(dockerId);
    counter++;
  }
  if (zeroReplicasRemain) {
    await removeServiceCommand(dockerId);
  }
}

async function parseServiceInformation(dockerId: string) {
  try {
    const stdout = await monitorDeployment(dockerId);
    logger.debug(stdout);
    const parsedInfo = serviceInformationSchema.parse(stdout);
    logger.debug(JSON.stringify(parsedInfo));
    logger.debug(parsedInfo);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function monitorDeployment(dockerId: string) {
  let serviceInformation: string | undefined;
  try {
    const {stdout} = await execa('docker', [
      'service',
      'ls',
      '--format',
      'json',
      '--filter',
      `name=${dockerId}`,
    ]);
    serviceInformation = stdout;
  } catch (error) {
    logger.error(error);
    serviceInformation = undefined;
  }
  assert(serviceInformation !== undefined);
  return serviceInformation;
}

async function removeServiceCommand(dockerId: string) {
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
