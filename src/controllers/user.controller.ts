import { NextFunction, Request, Response } from 'express';
import AccessTokenError from '../errors/access_token.error.js';
import SpotifyAuthError from '../errors/spotify_auth.error.js';
import RecordNotFoundError from '../errors/record_not_found.error.js';
import userDb from '../data_access/user.data.js';
import userService from '../services/user.service.js';
import { UploadedFile } from 'express-fileupload';
import config from '../config/general.config.js';
import { Timeframe } from '../models/user.model.js';

/**
 * Controller for the GET users/[username]/info endpoint.
 * Gets user information for the user with the requested username.
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
      where: { username: req.params.username }
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
 * Controller for the GET users/[username]/track-history endpoint.
 * Updates the user's streaming history then returns the last 10 tracks
 * the user has listened to.
 * If the profile is private data is only returned if the logged in user
 * is the account owner.
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
      where: { username: req.params.username }
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
 * Controller for the GET users/[username]/tracks endpoint.
 * Returns the users top 10 streamed tracks for the requested timeframe.
 * If no timeframe is specified the user's default timeframe is used.
 * If the profile is private data is only returned if the logged in user
 * is the account owner.
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
      where: { username: req.params.username }
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
      timeframe = req.query.timeframe as Timeframe;
    }
    // Use the requested limit if it exists, otherwise default limit to 10
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    // Use the requested page number if it exists, otherwise default to page 1
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const topTracks = await userService.getTopTracks(
      user.id,
      limit,
      page,
      timeframe
    );
    return res.json({
      tracks: topTracks,
      style: user.topTracksStyle,
      timeframe: timeframe,
      total: await userService.getTrackStreamCount(user.id, timeframe)
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
 * Controller for the GET users/[username]/albums endpoint.
 * Returns the users top 10 streamed albums for the requested timeframe.
 * If no timeframe is specified the user's default timeframe is used.
 * If the profile is private data is only returned if the logged in user
 * is the account owner.
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
      where: { username: req.params.username }
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
      timeframe = req.query.timeframe as Timeframe;
    }
    // Use the requested limit if it exists, otherwise default limit to 10
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    // Use the requested page number if it exists, otherwise default to page 1
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const topAlbums = await userService.getTopAlbums(
      user.id,
      limit,
      page,
      timeframe
    );
    return res.json({
      albums: topAlbums,
      style: user.topAlbumsStyle,
      timeframe: timeframe,
      total: await userService.getAlbumStreamCount(user.id, timeframe)
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
 * Controller for the GET users/[username]/artists endpoint.
 * Returns the users top 10 streamed artists for the requested timeframe.
 * If no timeframe is specified the user's default timeframe is used.
 * If the profile is private data is only returned if the logged in user
 * is the account owner.
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
      where: { username: req.params.username }
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
      timeframe = req.query.timeframe as Timeframe;
    }
    // Use the requested limit if it exists, otherwise default limit to 10
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    // Use the requested page number if it exists, otherwise default to page 1
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const topArtists = await userService.getTopArtists(
      user.id,
      limit,
      page,
      timeframe
    );
    return res.json({
      artists: topArtists,
      style: user.topArtistsStyle,
      timeframe: timeframe,
      total: await userService.getArtistStreamCount(user.id, timeframe)
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
 * Controller for the GET users/[userId]/current-track endpoint.
 * Returns the current track the user is listening to on Spotify.
 * If the user is not currently streaming a track the last streamed
 * track is returned, with a flag indicating it is not being streamed
 * currently.
 * If the profile is private data is only returned if the logged in user
 * is the account owner.
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
    const { userId } = req.params;
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
 * Updates various settings for the users profile and account.
 * Valid settings that can be updated are:
 *    username: string,
 *    email: string,
 *    password: string,
 *    privateProfile: boolean,
 *    topTracksTimeframe: "week" | "month" | "year" | "all",
 *    topTracksStyle: "list" | "grid" | "chart",
 *    topAlbumsTimeframe: "week" | "month" | "year" | "all",
 *    topAlbumsStyle: "list" | "grid" | "chart",
 *    topArtistsTimeframe: "week" | "month" | "year" | "all",
 *    topArtistsStyle: "list" | "grid" | "chart".
 * @param req Express Request object.
 * @param res Express Response object.
 * @param next next middleware function.
 */
export const patchUserSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate user exists, needed as updateUserSettings can try to update
    // Auth0 settings first which does not throw RecordNotFoundError.
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
    const picture = req.files.picture as UploadedFile;
    if (picture.mimetype !== 'image/jpeg' && picture.mimetype !== 'image/png') {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Image must be in JPEG or PNG format.'
        }
      });
    }
    const results = await userService.updateUserImage(
      req.user.id,
      picture,
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
    const picture = req.files.picture as UploadedFile;
    if (picture.mimetype !== 'image/jpeg' && picture.mimetype !== 'image/png') {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Image must be in JPEG or PNG format.'
        }
      });
    }
    const results = await userService.updateUserImage(
      req.user.id,
      picture,
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
 * Controller for the DELETE users/[userId] endpoint.
 * Deletes the user account and all associated data.
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
    const { userId } = req.params;
    await userService.deleteAccount(userId);
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
