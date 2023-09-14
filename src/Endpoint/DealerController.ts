import bodyParser from 'body-parser';
import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import ip from 'ip';
import multer from 'multer';
import {ILogic, Logic} from '../Logic/Logic';
import assert from 'assert';
import {AllTestsReservedError, debugError} from '../Errors/CustomErrors';

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
      console.error(`Error: ${error.name}`);
      response.json({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    };

    this.endpoint.post('/start-suite', async (request, response) => {
      const suiteId = await this.logicLayer.startTestSuite();
      response.json({suiteId: suiteId});
    });

    this.endpoint.get('/reserve-test/:suiteID', async (request, response) => {
      const testId = await this.logicLayer.reserveTest(request.params.suiteID);
      response.json({testID: testId});
    });

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

    this.endpoint.get('/debug/:SZOVEG', async (request, response, next) => {
      console.log('debug!');
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
      console.log(
        `Log: server running at http://${this.backendIp}:${this.backendPort}`
      );
    });
  }
}
