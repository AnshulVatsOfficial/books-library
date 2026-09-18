import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' ? (res as any).message || res : res;
    } else if (exception?.name === 'CastError') {
      // Mongoose invalid ObjectId error
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ID format: ${exception.value}`;
    } else if (exception?.name === 'ValidationError') {
      // Mongoose schema validation error
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception?.message) {
      message = exception.message;
    }

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(
        message,
      )}`,
      exception?.stack,
    );

    // Prevent response hanging if headers were not sent
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
