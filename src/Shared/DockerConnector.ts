import execa from 'execa';

async function createDeployment(suiteId: string, dockerId: string) {
  const parameters = `docker service create --env SUITE_ID=${suiteId} --env IP_ADDRESS=10.53.40.22 --name ${dockerId} --replicas 1 worker-image:latest`;

  try {
    const {stdout} = await execa(parameters);
    console.log(stdout);
  } catch (error) {
    console.error(error);
    //TODO throw deployment error
  }
}

async function removeDeployment(dockerId: string) {
  try {
    const {stdout} = await execa('docker service rm', [dockerId]);
    console.log(stdout);
  } catch (error) {
    console.error(error);
    //TODO throw rm error
  }
}

export {createDeployment, removeDeployment};
