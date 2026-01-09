import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainValidationError,
  DuplicateKeyError,
  EntityNotFoundError,
} from '../purchases/domain/errors/errors';

@Catch(EntityNotFoundError, DomainValidationError, DuplicateKeyError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (err instanceof EntityNotFoundError) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ statusCode: 404, message: err.message });
    }
    if (err instanceof DomainValidationError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: err.message,
        details: err.details,
      });
    }
    if (err instanceof DuplicateKeyError) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: 409,
        message: err.message,
        details: err.details,
      });
    }
  }
}
