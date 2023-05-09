import { NextFunction, Request, Response } from 'express';
import {
  AccessTokenError,
  RecordNotFoundError,
  SpotifyAuthError
} from '../data_access/errors.js';
import userDb from '../data_access/user.data.js';
import userService from '../services/user.service.js';
import { UploadedFile } from 'express-fileupload';
import config from '../config/general.config.js';
import { Timeframe } from '../models/user.model.js';

/**
 * Controller for the GET users/:id endpoint.
 * Gets user information for the requested username.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    return res.json({
      id: user.id,
      username: user.username,
      image: `${config.domain}${user.picture}`,
      bannerImage: `${config.domain}${user.bannerPicture}`,
      createdAt: user.createdAt,
      streamCount: await userService.getStreamCount(user.id),
      privateProfile: user.privateProfile
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
 * Controller for the GET users/:id/profile endpoint.
 * Returns all data displayed on the users profile page.
 *  - Last 10 tracks the user streamed on Spotify.
 *  - Top 10 streamed tracks.
 *  - Top 10 streamed artists.
 *  - Top 10 streamed albums.
 * If the profile is private only the account owner can view the profile.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const getUserTrackHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Query param contains username, get the userId.
    const user = await userDb.getUser({
      where: { username: req.params.user }
    });
    if (user.privateProfile && req.user?.id !== user.id) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User profile is private'
        }
      });
    }
    const recentlyPlayed = await userService.getTrackHistory(user.id, 10);
    return res.json({
      spotifyError: recentlyPlayed.spotifyError,
      recentTracks: recentlyPlayed.tracks
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
 * Controller for the GET users/:id/recap endpoint.
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
 * Controller for the GETusers/:id/discover endpoint.
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
 * Controller for the GET users/:id/tracks endpoint.
 * Returns the users top 10 streamed tracks.
 * If the profile is private only the account owner can view the top tracks.
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
    if (user.privateProfile && req.user?.id !== user.id) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User profile is private'
        }
      });
    }
    // Use the timeframe from the query param if it exists, otherwise use the
    // timeframe setting for the user.
    let timeframe = user.topTracksTimeframe!;
    if (req.query.timeframe) {
      //TODO: Validate the timeframe
      timeframe = req.query.timeframe as Timeframe;
    }
    const topTracks = await userService.getTopTracks(user.id, 10, timeframe);
    return res.json({
      tracks: topTracks,
      style: user.topTracksStyle,
      timeframe: timeframe
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
 * Controller for the GET users/:id/albums endpoint.
 * Returns the users top 10 streamed albums.
 * If the profile is private only the account owner can view the top albums.
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
    if (user.privateProfile && req.user?.id !== user.id) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User profile is private'
        }
      });
    }
    // Use the timeframe from the query param if it exists, otherwise use the
    // timeframe setting for the user.
    let timeframe = user.topAlbumsTimeframe!;
    if (req.query.timeframe) {
      //TODO: Validate the timeframe
      timeframe = req.query.timeframe as Timeframe;
    }
    const topAlbums = await userService.getTopAlbums(user.id, 10, timeframe);
    return res.json({
      albums: topAlbums,
      style: user.topAlbumsStyle,
      timeframe: timeframe
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
 * Controller for the GET users/:id/artists endpoint.
 * Returns the users top 10 streamed artists.
 * If the profile is private only the account owner can view the top artists.
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
    if (user.privateProfile && req.user?.id !== user.id) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User profile is private'
        }
      });
    }
    // Use the timeframe from the query param if it exists, otherwise use the
    // timeframe setting for the user.
    let timeframe = user.topArtistsTimeframe!;
    if (req.query.timeframe) {
      //TODO: Validate the timeframe
      timeframe = req.query.timeframe as Timeframe;
    }
    const topArtists = await userService.getTopArtists(user.id, 10, timeframe);
    return res.json({
      artists: topArtists,
      style: user.topArtistsStyle,
      timeframe: timeframe
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
 * Controller for the GET users/userid/current-track endpoint.
 * Returns the current track the user is listening to on Spotify.
 * If the user is not currently streaming a track the last streamed
 * track is returned, with a flag indicating it is not being streamed
 * currently.
 * If the profile is private only the account owner can view the current track.
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
    const user = await userDb.getUserById(userId);
    if (user.privateProfile && req.user?.id !== user.id) {
      return res.status(403).json({
        error: {
          status: 403,
          message: 'User profile is private'
        }
      });
    }
    const currentTrack = await userService.getCurrentlyPlayingTrack(userId);
    return res.json({ ...currentTrack });
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
 * Controller for the GET users/settings endpoint.
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
      bannerPicture: `${config.domain}${user.bannerPicture}`,
      topTracksTimeframe: user.topTracksTimeframe,
      topTracksStyle: user.topTracksStyle,
      topAlbumsTimeframe: user.topAlbumsTimeframe,
      topAlbumsStyle: user.topAlbumsStyle,
      topArtistsTimeframe: user.topArtistsTimeframe,
      topArtistsStyle: user.topArtistsStyle,
      spotifyConnection:
        user.spotifyRefreshToken !== null &&
        user.spotifyAccessToken !== null &&
        user.spotifyTokenExpires !== null
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
 * Controller for the PATCH users/settings endpoint.
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
 * Controller for the POST users/profile-image endpoint.
 * Updates the users profile picture to the image in the request.
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
    // TODO: validate file
    const results = await userService.updateUserImage(
      req.user.id,
      req.files.picture as UploadedFile,
      'profile'
    );
    return res.json({
      newImage: `${config.domain}${results}`
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
 * Controller for the POST users/banner-image endpoint.
 * Updates the users banner picture to the image in the request.
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const postBannerImage = async (
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
    // TODO: validate file
    const results = await userService.updateUserImage(
      req.user.id,
      req.files.picture as UploadedFile,
      'banner'
    );
    return res.json({
      newImage: `${config.domain}${results}`
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
 * Controller for the POST users/add endpoint.
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
 * Controller for the POST users/spotify endpoint.
 * Connects the users Spotify account to their soundTrack account.
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
    if (error instanceof SpotifyAuthError) {
      return res.status(400).json({
        error: {
          status: 400,
          message: error.message
        }
      });
    }
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
 * Controller for the DELETE users/spotify endpoint.
 * Disconnects the users Spotify account from their soundTrack account.
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
    await userService.deleteSpotifyConnection(req.user.id);
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

/**
 * Controller for the DELETE users/:userid endpoint.
 * Deletes the user account.
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
