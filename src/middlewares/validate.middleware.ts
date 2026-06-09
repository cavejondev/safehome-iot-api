/**
 * Middleware generico para validar body, params e query com Zod.
 */
import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { BAD_REQUEST } from 'http-status-codes';

import { AppError } from '../shared/errors/app-error';

interface ValidationSchema {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schema: ValidationSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const bodyResult = schema.body?.safeParse(request.body);
    const paramsResult = schema.params?.safeParse(request.params);
    const queryResult = schema.query?.safeParse(request.query);

    const error = bodyResult?.error ?? paramsResult?.error ?? queryResult?.error;

    if (error) {
      next(new AppError('Dados invalidos na requisicao', BAD_REQUEST, error.flatten()));
      return;
    }

    if (bodyResult?.data) {
      request.body = bodyResult.data;
    }

    if (paramsResult?.data) {
      request.params = paramsResult.data as Request['params'];
    }

    if (queryResult?.data) {
      request.query = queryResult.data as Request['query'];
    }

    next();
  };
}
