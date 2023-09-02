import {execa} from 'execa';

async function issueCommand(params: string) {
  try {
    const {stdout} = await execa('docker service', [params]);
    console.log(stdout);
  } catch (error) {
    console.log(error);
    //TODO throw issue error
  }
}

async function createDeployment(suiteId: string, dockerId: string) {
  const parameters = [
    'create',
    '--env',
    suiteId,
    '--name',
    dockerId,
    '--replicas',
    '10',
    'worker-image',
  ];
  try {
    await issueCommand(parameters.join(' '));
  } catch (error) {
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  try {
    const parameters = ['rm', dockerId];
    await issueCommand(parameters.join(' '));
  } catch (error) {
    //TODO throw rm error
  }
}

export {createDeployment, removeDeployment};
