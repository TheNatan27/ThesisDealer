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

export async function trackDeployment(dockerId: string) {
  await sleep(10_000);
  let doesDeploymentExist = true;
  while (doesDeploymentExist) {
    const serviceInformation = await requestServiceInformation(dockerId);
    const parsedInformation = serviceInformationSchema.parse(
      JSON.parse(serviceInformation!)
    );
    emitTrackingData(parsedInformation, dockerId);
    await sleep(500);
    doesDeploymentExist = await checkIfServiceExists(dockerId);
  }
}

function emitTrackingData(
  serviceInformation: ServiceInformationSchema,
  dockerId: string
) {
  io.emit('track-deployment-debug', {
    replicas: serviceInformation.Replicas,
  });
}
