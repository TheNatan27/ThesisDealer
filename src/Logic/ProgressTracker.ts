import {io} from '../Socket/socketServer';
import {
  checkIfServiceExists,
  requestServiceInformation,
} from '../Shared/DockerConnector';
import {
  ServiceInformationSchema,
  serviceInformationSchema,
} from '../Shared/CustomTypes';
import {sleep} from '../Shared/Utilities';
import {logger} from '../Shared/Logger';

export async function trackDeployment(dockerId: string, suiteId: string) {
  await sleep(10_000);
  let doesDeploymentExist = true;
  while (doesDeploymentExist) {
    const serviceInformation = await requestServiceInformation(dockerId);
    const parsedInformation = parseServiceInformation(serviceInformation!);
    if (parsedInformation !== null) {
      emitTrackingData(parsedInformation, suiteId);
      await sleep(750);
    } else {
      doesDeploymentExist = await checkIfServiceExists(dockerId);
    }
  }
}

function emitTrackingData(
  serviceInformation: ServiceInformationSchema,
  suiteId: string
) {
  const resultNumbers = processReplicaInformationWithRegex(
    serviceInformation.Replicas
  );
  io.emit('track-deployment-status', {
    doneReplicas: resultNumbers.doneReplicas,
    allReplicas: resultNumbers.allReplicas,
    suiteId: suiteId,
  });
}

function parseServiceInformation(serviceInformation: string) {
  try {
    const parsedInformation = serviceInformationSchema.parse(
      JSON.parse(serviceInformation!)
    );
    return parsedInformation;
  } catch (error) {
    logger.error('Failed to parse service information for emission.');
    return null;
  }
}

function processReplicaInformationWithRegex(replicaInformation: string) {
  const insideParanthesis = replicaInformation.match(
    /\([0-9]+\/[0-9]+\scompleted\)/
  );
  const doneAndAllReplicas = insideParanthesis![0]
    .match(/[0-9]+\/[0-9]+/)![0]
    .split('/');
  type DeploymentStatus = {
    doneReplicas: number;
    allReplicas: number;
  };
  const deploymentStatus: DeploymentStatus = {
    doneReplicas: parseInt(doneAndAllReplicas[0]),
    allReplicas: parseInt(doneAndAllReplicas[1]),
  };
  return deploymentStatus;
}
