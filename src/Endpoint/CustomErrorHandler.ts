import {NextFunction, Request, Response} from 'express';
import {logger} from '../Shared/Logger';

export const CustomErrorHandler = (
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
