import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { unlink } from 'fs/promises';

@Catch(HttpException)
export class UploadExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // If there is an error and a file was uploaded, delete it
    if (request.file) {
      await unlink(request.file.path).catch(() => {});
    }

    response.status(status).json(exception.getResponse());
  }
}
