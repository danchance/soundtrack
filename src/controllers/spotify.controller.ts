import { NextFunction, Request, Response } from 'express';
import { requestAccessToken } from '../services/spotify/auth.js';

/**
 * Controller for the tracks/:id endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware function
 */
export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await requestAccessToken(req.body.code, req.body.redirectUri);
  } catch (error) {
    console.log('--------------ERROR--------------');
    console.error(error);
  }

  return res.json('');
};
