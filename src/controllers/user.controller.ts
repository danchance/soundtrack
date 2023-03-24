import { NextFunction, Request, Response } from 'express';
import {
  AccessTokenError,
  RecordNotFoundError
} from '../data_access/errors.js';
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
 * Returns the last 10 tracks the user streamed on Spotify.
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
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    const recentlyPlayed = await userService.updateTrackHistory(user.id, 10);
    return res.json({ tracks: recentlyPlayed });
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return res.status(404).json({
        error: {
          status: 404,
          message: error.message
        }
      });
    }
    if (error instanceof AccessTokenError) {
      return res.status(401).json({
        error: {
          status: 401,
          message: error.message
        }
      });
    }
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
 * Returns the users top 10 albums. Top albums are calculated by the number of
 * times the user has listened to a track from the album.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getUserAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    const topAlbums = await userService.getUserTopAlbums(user.id, 10);
    return res.json({ albums: topAlbums });
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return res.status(404).json({
        error: {
          status: 404,
          message: error.message
        }
      });
    }
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
