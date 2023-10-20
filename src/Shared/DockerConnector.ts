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
  logger.debug(`removeDeployment loop started for: ${dockerId}`);
  while (!zeroReplicasRemain && counter < 10) {
    zeroReplicasRemain = await parseServiceInformation(dockerId);
    logger.debug(`zeroRepliasRemain value: ${zeroReplicasRemain}`);
    await sleep(1_000);
    counter++;
  }
  if (zeroReplicasRemain) {
    await removeServiceCommand(dockerId);
  }
}

async function parseServiceInformation(dockerId: string) {
  try {
    const {stdout} = await execa('docker', [
      'service',
      'ls',
      '--format',
      'json',
      '--filter',
      `name=${dockerId}`,
    ]);
    assert(stdout !== undefined);
    logger.debug(`Parsed service information: ${stdout}`);
    serviceInformationSchema.parse(JSON.parse(stdout));
    return true;
  } catch (error) {
    logger.error('Failed to parse service information.');
    return false;
  }
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

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
