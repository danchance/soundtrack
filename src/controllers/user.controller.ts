import { NextFunction, Request, Response } from 'express';
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
    setTimeout(() => {
      return res.json({
        tracks: [
          {
            track: {
              id: '1',
              name: 'Track One',
              duration: 191,
              artwork:
                'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              artist: 'Artist One'
            },
            playedAt: new Date()
          },
          {
            track: {
              id: '2',
              name: 'Track Two',
              duration: 191,
              artwork:
                'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              artist: 'Artist One'
            },
            playedAt: new Date()
          },
          {
            track: {
              id: '3',
              name: 'Track Three',
              duration: 191,
              artwork:
                'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              artist: 'Artist One One One One One One'
            },
            playedAt: new Date()
          },
          {
            track: {
              id: '4',
              name: 'Track Four Four Four Four Four',
              duration: 191,
              artwork:
                'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              artist: 'Artist One'
            },
            playedAt: new Date()
          },
          {
            track: {
              id: '5',
              name: 'Track Five',
              duration: 191,
              artwork:
                'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
              artist: 'Artist Two'
            },
            playedAt: new Date()
          }
        ]
      });
    }, 3000);
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
 * Controller for the users/add endpoint.
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
    console.log('User added');
    return res.json({ status: 'success' });
  } catch (error) {
    return next(error);
  }
};
