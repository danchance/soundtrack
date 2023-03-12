import { NextFunction, Request, Response } from 'express';

/**
 * Controller for the users/:id endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.user);
    return res.json({ user: { email: 'user@email.com' } });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for the users/:id/overview endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserOverview = (
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

/**
 * Controller for the users/:id/recap endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserRecap = (
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

/**
 * Controller for the users/:id/discover endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserDiscover = (
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

/**
 * Controller for the users/:id/tracks endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserTracks = (
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

/**
 * Controller for the users/:id/albums endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserAlbums = (
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

/**
 * Controller for the users/:id/artists endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserArtists = (
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
