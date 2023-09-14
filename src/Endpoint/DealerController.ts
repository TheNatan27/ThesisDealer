import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import ip from 'ip';
import multer from 'multer';
import {ILogic, Logic} from '../Logic/Logic';
import {InitialTestSchema} from '../Repository/TestClassTypes';
import {ErrorSchema} from '../Shared/CustomTypes';
import {
  dockerCommand,
  startDeployment,
  stopDeployment,
} from '../Docker/DockerConnection';
import path from 'path';

export class DealerController {
  readonly endpoint = express();
  readonly backendPort: string;
  readonly backendIp: string;
  readonly upload: multer.Multer;
  readonly logicLayer: ILogic = new Logic();

  constructor() {
    this.backendPort = process.env.BACKEND_PORT || '30552';
    this.backendIp = process.env.BACKEND_IP || ip.address();
    const storage = multer.diskStorage({
      destination(req, file, callback) {
        callback(null, './result-files');
      },
      filename(req, file, callback) {
        callback(null, file.originalname);
      },
    });
    this.upload = multer({storage});

    this.endpoint.use(cors());
    this.endpoint.use(bodyParser.json());
    this.endpoint.use(bodyParser.urlencoded({extended: true}));

    this.endpoint.post('/start-suite', async (request, response) => {
      const suiteId = await this.logicLayer.startTestSuite();
      response.json({suiteId: suiteId});
    });

    this.endpoint.get('/reserve-testId/:suiteID', async (request, response) => {
      const testId = await this.logicLayer.reserveTest(request.params.suiteID);
      response.json({test_id: testId});
    });

    this.endpoint.get(
      '/request-test-script/:suiteID/:testID',
      async (request, response) => {
        const testPath = await this.logicLayer.drawTest(
          request.params.suiteID,
          request.params.testID
        );

        response.download(testPath);
      }
    );

    this.endpoint.post(
      '/return-test/:suiteID/:testID',
      this.upload.single('result' as string),
      async (request, response) => {
        await this.logicLayer.returnTest(
          (await request.body) as {result: string},
          request.params.suiteID,
          request.params.testID
        );
        response.json({received: 'ok'});
      }
    );

    // DEBUG
    this.endpoint.post('/startgame-dev', async (request, response) => {
      const suiteID = this.logicLayer.startTestSuite();
      response.json({suiteID: suiteID});
    });

    this.endpoint.get('/debug', async (request, response) => {
      await startDeployment('debug');
      response.json({received: 'ok'});
    });
    this.endpoint.get('/end', async (request, response) => {
      await stopDeployment('debug');
      response.json({received: 'ok'});
    });

    this.endpoint.get(
      '/request/:suiteID/:testID',
      async (request, response) => {
        console.log(request.params.suiteID, request.params.testID);

        const data = path.join(
          __dirname,
          '../../testfile-storage/testone.spec.ts'
        );
        response.download(data);
      }
    );

    this.endpoint.get('/reserve/:suiteID', async (request, response) => {
      response.json({test_id: 'probaid'});
    });

    this.endpoint.post(
      '/return/:suiteID/:testID',
      this.upload.single('result' as string),
      async (request, response) => {
        const suite_id = request.params.suiteID;
        const test_id = request.params.testID;
        const resultData = await request.body;
        await this.logicLayer.returnTest(
          {result: resultData},
          suite_id,
          test_id
        );
        response.json({received: 'ok'});
      }
    );

    // DEBUG
  }

  async startListening() {
    this.endpoint.listen(this.backendPort, () => {
      console.log(
        `Log: server running at http://${this.backendIp}:${this.backendPort}`
      );
    });
  }
}
