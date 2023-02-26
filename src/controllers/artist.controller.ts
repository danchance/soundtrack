import { NextFunction, Request, Response } from 'express';

/**
 * Controller for the artists/:id endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtist = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({});
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for the artists/:id/albums endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtistAlbums = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({});
  } catch (error) {
    return next(error);
  }
};
