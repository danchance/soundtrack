import { NextFunction, Request, Response } from 'express';
import {
  AccessTokenError,
  RecordNotFoundError
} from '../data_access/errors.js';
import userDb from '../data_access/user.data.js';
import userService from '../services/user.service.js';
import { UploadedFile } from 'express-fileupload';
import config from '../config/general.config.js';

/**
 * Controller for the users/:id endpoint.
 * Gets user information for the requested username.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        image: `${config.domain}${user.picture}`,
        createdAt: user.createdAt
      }
    });
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
 * Controller for the users/:id/profile endpoint.
 * Returns all data displayed on the users profile page.
 *  - Last 10 tracks the user streamed on Spotify.
 *  - Top 10 streamed tracks.
 *  - Top 10 streamed artists.
 *  - Top 10 streamed albums.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId.
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    const recentlyPlayed = await userService.updateTrackHistory(user.id, 10);
    const topTracks = await userService.getTopTracks(user.id, 10);
    const topAlbums = await userService.getTopAlbums(user.id, 10);
    const topArtists = await userService.getTopArtists(user.id, 10);
    return res.json({
      recentTracks: recentlyPlayed,
      tracks: topTracks,
      albums: topAlbums,
      artists: topArtists
    });
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
 * Controller for the users/:id/history endpoint.
 * Returns the last 10 tracks the user streamed on Spotify.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId.
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
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
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
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
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
 * Returns the users top 10 streamed tracks.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserTracks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    const topTracks = await userService.getTopTracks(user.id, 10);
    return res.json({ tracks: topTracks });
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
 * Controller for the users/:id/albums endpoint.
 * Returns the users top 10 streamed albums.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
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
    const topAlbums = await userService.getTopAlbums(user.id, 10);
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
 * Returns the users top 10 streamed artists.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserArtists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    const topArtists = await userService.getTopArtists(user.id, 10);
    return res.json({ artists: topArtists });
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
 * Controller for the users/userid/current-track endpoint.
 * Returns the current track the user is listening to on Spotify.
 * If the user is not currently streaming a track the last streamed
 * track is returned, with a flag indicating it is not being streamed
 * currently.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserCurrentTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userid;
    const currentTrack = await userService.getCurrentlyPlayingTrack(userId);
    return res.json({ track: currentTrack });
  } catch (error) {
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
 * Controller for the users/settings endpoint.
 * Returns the users settings.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userDb.getUserById(req.user.id);
    return res.json({
      privateProfile: user.privateProfile,
      profilePicture: `${config.domain}${user.picture}`,
      topTracksTimeframe: user.topTracksTimeframe,
      topTracksStyle: user.topTracksStyle,
      topAlbumsTimeframe: user.topAlbumsTimeframe,
      topAlbumsStyle: user.topAlbumsStyle,
      topArtistsTimeframe: user.topArtistsTimeframe,
      topArtistsStyle: user.topArtistsStyle,
      spotifyConnection: user.spotifyRefreshToken !== null
    });
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
 * Controller for the users/settings endpoint.
 * Valid settings include:
 * - username, email, password, picture, privateProfile,
 *   topTracksTimeframe, topTracksStyle, topAlbumsTimeframe
 *   topAlbumsStyle, topArtistsTimeframe, topArtistsStyle
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const patchUserSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const settings: { [k: string]: any } = {};
  const status: { [k: string]: any } = {};
  // Validate the settings in the request body.
  if (req.body.username) {
    // between 3 and 15 characters
    // only contain certain characters

    //passed checks
    settings.username = req.body.username;
  }
  if (req.body.email) {
    // TODO:

    //passed checks
    settings.email = req.body.email;
  }
  if (req.body.password) {
    if (req.body.password !== req.body.passwordConfirm) {
      status.password = {
        status: 'failure',
        message: 'Passwords do not match.'
      };
    }

    //passed checks
    settings.password = req.body.password;
  }
  try {
    // Validate user exists.
    await userDb.getUserById(req.user.id);
    const results = await userService.updateUserSettings(req.user.id, req.body);
    return res.json(results);
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
 * Controller for the users/profile-image endpoint.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const postProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'No files were uploaded.'
        }
      });
    }
    const results = await userService.updateProfilePicture(
      req.user.id,
      req.files.picture as UploadedFile
    );
    return res.json({
      newProfilePicture: `${config.domain}${results}`
    });
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
 * Controller for the users/add endpoint.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
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
 * Controller for the users/spotify endpoint.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const postSpotifyConnection = async (
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
    // Add error to spotify POST to handle invalid code.
    // can replicate by refreshing page with code in url.
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
 * Controller for the users/spotify endpoint.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const deleteSpotifyConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({ status: 'success' });
  } catch (error) {
    // TODO: Errors to handle
    // Add error to spotify POST to handle invalid code.
    // can replicate by refreshing page with code in url.
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
 * Controller for the users/:userid endpoint.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.deleteAccount(req.user.id);
    return res.json({ status: 'success' });
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
