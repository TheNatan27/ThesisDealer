import bodyParser from 'body-parser';
import cors from 'cors';
import express, {NextFunction, Request, Response, response} from 'express';
import ip from 'ip';
import multer from 'multer';
import {ILogic, Logic} from '../Logic/Logic';
import {AllTestsReservedError} from '../Errors/CustomErrors';
import GlobalConnection from '../Shared/PostgresConnector';
import {logger} from '../Shared/Logger';

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

    const ErrorHandler = (
      error: Error,
      request: Request,
      response: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction
    ) => {
      logger.error(error.name);
      response.statusCode = 500;
      response.json({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    };

    this.endpoint.post('/run-benchmark', async (request, response, next) => {
      await this.logicLayer.runConcurrencyBenchmark();
      response.json({'benchmark-run': 'started'});
    });

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
          response: this.logicLayer.startTestSuite(
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
    this.endpoint.post('/startgame-dev', async (request, response) => {
      //const suiteID = this.logicLayer.startTestSuite();
      //response.json({suiteID: suiteID});
    });

    this.endpoint.get('/debug/:SZOVEG', async (request, response, next) => {
      logger.info('thisisthedebugendpoint');

      try {
        throw new AllTestsReservedError(request.params.SZOVEG);
      } catch (error) {
        next(error);
      }
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
