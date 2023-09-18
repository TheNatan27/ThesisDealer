import execa from 'execa';
import dotenv from 'dotenv';

async function createDeployment(
  suiteId: string,
  dockerId: string,
  replicas: number
) {
  dotenv.config();
  const ipAddresss = process.env.IP_ADDRESS!;
  const parameters = `docker service create --env SUITE_ID=${suiteId} --env IP_ADDRESS=${ipAddresss} --name ${dockerId} --replicas ${replicas} worker-image:latest`;

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
      replicas,
      'merninfo/worker-image:latest',
    ]);
  } catch (error) {
    console.error(error);
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  console.log(`Remove docker service: ${dockerId}`);
  try {
    const {stdout} = await execa('docker', ['service', 'rm', dockerId]);
    console.log(stdout);
  } catch (error) {
    console.error(error);
    //TODO throw remove error
  }
}

export {createDeployment, removeDeployment};
