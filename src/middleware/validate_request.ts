import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BadRequestError from '../errors/bad_request.error.js';

/**
 * Middleware function to validate request parameters.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 * @throws BadRequestError if validation of request parameters fails.
 */
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array());
  }
  next();
};

export default validateRequest;
