import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BadRequestError from '../errors/bad_request.error';

/**
 * Middleware function to validate request parameters.
 * Throws a BadRequestError if validation of request parameters fails,
 * saving the validation errors in the BadRequestError instance.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array());
  }
  next();
};

export default validateRequest;
