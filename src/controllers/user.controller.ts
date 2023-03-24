import { NextFunction, Request, Response } from 'express';
import userDb from '../data_access/user.data.js';
import userService from '../services/user.service.js';

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
 * Controller for the users/:id/history endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId
    const user = (
      await userDb.getUsers({
        limit: 1,
        where: { username: req.params.user }
      })
    ).rows[0];
    const recentlyPlayed = await userService.updateTrackHistory(user.id, 10);
    return res.json({ tracks: recentlyPlayed });
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

/**
 * Controller for the users/add endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const postUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('User added');
    return res.json({});
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller for the users/spotify/auth endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const postSpotifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.authenticateSpotifyUser(
      req.user.id,
      req.body.code,
      req.body.redirectUri
    );
    return res.json({ status: 'success' });
  } catch (error) {
    // TODO: Errors to handle
    // - SpotifyAPI
    // - User database
    // - Param validation
    return next(error);
  }
};
