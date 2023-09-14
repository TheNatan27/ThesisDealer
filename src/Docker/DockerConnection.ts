/* eslint-disable node/no-unpublished-import */
import execa from 'execa';

async function dockerCommand(params: string[]) {
  try {
    const command = await execa('docker', params);
    console.log(command.stdout);
    console.log(command.exitCode);
  } catch (error) {
    console.error(error);
  }
}

async function startDeployment(suiteId: string) {
  await dockerCommand([
    'service',
    'create',
    '--name',
    suiteId,
    '--env',
    `SUITE_ID=${suiteId}`,
    '--replicas',
    '4',
    'worker',
  ]);
}

async function stopDeployment(suiteId: string) {
  await dockerCommand(['service', 'rm', suiteId]);
}

export {dockerCommand, startDeployment, stopDeployment};
