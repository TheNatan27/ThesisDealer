import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import ip from 'ip';
import multer from 'multer';
import {ILogic, Logic} from '../Logic/Logic';

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
      const suiteId = this.logicLayer.startTestSuite();
      response.json({suiteId: suiteId});
    });

    this.endpoint.get('/request-test/:suiteID', async (request, response) => {
      const testClass = await this.logicLayer.requestTest(
        request.params.suiteID
      );
      response.download(testClass.script);
      console.log(`Log: ${testClass.name} drawn`);
    });

    this.endpoint.post(
      '/return-test/:suiteID',
      this.upload.single('result' as string),
      async (request, response) => {
        await this.logicLayer.returnTest(
          await request.body,
          request.params.suiteID
        );
        response.json({received: 'ok'});
      }
    );

    // DEBUG
    this.endpoint.post('/startgame-dev', async (request, response) => {
      const suiteID = await this.logicLayer.startTestSuite();
      response.json({suiteID: suiteID});
    });

    this.endpoint.get('/download/:suiteID', async (request, response) => {
      const testCard = await this.logicLayer.requestTest(
        request.params.suiteID
      );
      response.download(testCard.script);
      console.log(`Log: ${testCard.name} drawn`);
    });

    this.endpoint.get('/debug', async (request, response) => {
      console.log('debug received');
      response.json({debug: 'received', dirname: __dirname});
    });
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
