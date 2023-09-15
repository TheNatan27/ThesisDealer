import execa from 'execa';

async function issueCommand(params: string) {
  try {
    const {stdout} = await execa('docker', [params]);
    console.log(stdout);
  } catch (error) {
    console.log(error);
    //TODO throw issue error
  }
}

async function createDeployment(suiteId: string, dockerId: string) {
  const parameters = [
    'docker',
    'service',
    'create',
    '--name',
    dockerId,
    '--replicas',
    '2',
    '--env',
    `SUITE_ID=${suiteId}`,
    '--env',
    `IP_ADDRESS=${'192.168.100.39'}`,
    'worker',
  ];
  try {
    execa(parameters.join(' ')).stdout?.pipe(process.stdout);
  } catch (error) {
    console.log(error);
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  try {
    const parameters = ['docker', 'service', 'rm', dockerId];
    execa(parameters.join(' ')).stdout?.pipe(process.stdout);
  } catch (error) {
    //TODO throw rm error
  }
}

export {createDeployment, removeDeployment};
