import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import ip from 'ip';
import multer from 'multer';
import {Logic} from '../Logic/Logic';
import GlobalConnection from '../Shared/PostgresConnector';
import {logger} from '../Shared/Logger';
import {io} from '../Socket/socketServer';
import {CustomErrorHandler} from './CustomErrorHandler';
import {LogicInterface} from '../Logic/LogicInterface';

export class DealerController {
  readonly endpoint = express();
  readonly backendPort: string;
  readonly backendIp: string;
  readonly upload: multer.Multer;
  readonly logicLayer: LogicInterface = new Logic();

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

    const ErrorHandler = CustomErrorHandler;

    this.endpoint.post('/initialize-db', async (request, response, next) => {
      try {
        await GlobalConnection.getInstance().initialize();
      } catch (error) {
        next(error);
      }
      response.json({message: 'Database initialized.'});
    });

    this.endpoint.post(
      '/start-suite/:numberOfVms/:vmType/:concurrency?',
      async (request, response) => {
        const numberOfVms = parseInt(request.params.numberOfVms);
        const vmType = request.params.vmType;
        let concurrency;
        if (request.params.concurrency) {
          concurrency = parseInt(request.params.concurrency);
        }
        response.json({
          suiteId: await this.logicLayer.startTestSuite(
            numberOfVms,
            vmType,
            concurrency
          ),
        });
      }
    );

    this.endpoint.get(
      '/reserve-test/:suiteID',
      async (request, response, next) => {
        try {
          const testId = await this.logicLayer.reserveTest(
            request.params.suiteID
          );
          response.json({testID: testId});
        } catch (error) {
          next(error);
        }
      }
    );

    this.endpoint.get(
      '/request-test/:suiteID/:testID',
      async (request, response) => {
        const testScript = await this.logicLayer.requestTest(
          request.params.suiteID,
          request.params.testID
        );
        response.download(testScript);
      }
    );

    this.endpoint.post(
      '/return-test/:suiteID/:testID',
      this.upload.single('result' as string),
      async (request, response) => {
        this.logicLayer.returnTest(
          await request.body,
          request.params.suiteID,
          request.params.testID
        );
        response.json({received: 'ok'});
      }
    );

    // DEBUG
    this.endpoint.get('/debug/:SZOVEG', async (request, response, next) => {
      io.emit('track-deployment-debug', request.params.SZOVEG);
      response.json({debug: 'ok'});
    });
    // DEBUG

    this.endpoint.use(ErrorHandler);
  }

  async startListening() {
    this.endpoint.listen(this.backendPort, () => {
      logger.info(
        `Log: server running at http://${this.backendIp}:${this.backendPort}`
      );
    });
  }
}
