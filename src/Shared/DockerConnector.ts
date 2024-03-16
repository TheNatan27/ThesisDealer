import execa from 'execa';
import {logger} from './Logger';
import assert from 'assert';
import {serviceInformationSchemaStrict} from '../Types/CustomTypes';
import {sleep} from './Utilities';
import GlobalConfiguration from '../Configuration/Configuration';

async function createDeployment(
  suiteId: string,
  dockerId: string,
  suiteSize: number,
  concurrency?: number
) {
  if (concurrency) {
    createDeploymentWithDefinedConcurrency(
      suiteId,
      dockerId,
      suiteSize,
      concurrency
    );
  } else {
    createDeploymentWithDefaultConcurreny(suiteId, dockerId, suiteSize);
  }
}

async function createDeploymentWithDefinedConcurrency(
  suiteId: string,
  dockerId: string,
  suiteSize: number,
  concurrency: number
) {
  const ipAddress =
    GlobalConfiguration.getConfiguration().envVariables.IP_ADDRESS;

  try {
    await execa('docker', [
      'service',
      'create',
      '--env',
      `SUITE_ID=${suiteId}`,
      '--env',
      `IP_ADDRESS=${ipAddress}`,
      '--name',
      dockerId,
      '--replicas',
      suiteSize.toString(),
      '--mode',
      'replicated-job',
      '--max-concurrent',
      concurrency.toString(),
      'merninfo/worker-image:clean',
    ]);
  } catch (error) {
    logger.error(error);
    //TODO throw deployment error
  }
}

async function createDeploymentWithDefaultConcurreny(
  suiteId: string,
  dockerId: string,
  suiteSize: number
) {
  const ipAddress =
    GlobalConfiguration.getConfiguration().envVariables.IP_ADDRESS;

  try {
    await execa('docker', [
      'service',
      'create',
      '--env',
      `SUITE_ID=${suiteId}`,
      '--env',
      `IP_ADDRESS=${ipAddress}`,
      '--name',
      dockerId,
      '--replicas',
      suiteSize.toString(),
      '--mode',
      'replicated-job',
      'merninfo/worker-image:clean',
    ]);
  } catch (error) {
    logger.error(error);
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  let zeroReplicasRemain = false;
  let counter = 0;
  logger.debug(`RemoveDeployment loop started for: ${dockerId}`);
  while (!zeroReplicasRemain && counter < 10) {
    zeroReplicasRemain = await parseServiceInformation(dockerId);
    logger.debug(`ZeroRepliasRemain value: ${zeroReplicasRemain}`);
    await sleep(1_000);
    counter++;
  }
  if (zeroReplicasRemain) {
    await sleep(3_000);
    await removeServiceCommand(dockerId);
  }
}

export async function parseServiceInformation(dockerId: string) {
  try {
    const stdout = await requestServiceInformation(dockerId);
    assert(stdout !== undefined);
    logger.debug(`Parsed service information: ${stdout}`);
    serviceInformationSchemaStrict.parse(JSON.parse(stdout));
    return true;
  } catch (error) {
    logger.warn('Failed to parse service information.');
    return false;
  }
}

export async function requestServiceInformation(dockerId: string) {
  try {
    const {stdout} = await execa('docker', [
      'service',
      'ls',
      '--format',
      'json',
      '--filter',
      `name=${dockerId}`,
    ]);
    return stdout;
  } catch (error) {
    logger.error('Failed to request service information');
    return undefined;
  }
}

export async function checkIfServiceExists(dockerId: string) {
  try {
    await execa('docker', ['service', 'ps', dockerId, '--format', 'json']);
    return true;
  } catch (error) {
    logger.error('Service no longer exists.');
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
