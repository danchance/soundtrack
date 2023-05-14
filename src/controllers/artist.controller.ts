import { NextFunction, Request, Response } from 'express';
import artistDb from '../data_access/artist.data.js';
import { RecordNotFoundError } from '../data_access/errors.js';
import artistService from '../services/artist.service.js';
import config from '../config/general.config.js';
import albumDb from '../data_access/album.data.js';

/**
 * Controller for the GET artists/[artistSlug] endpoint.
 * Returns general information about the artist with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { artistSlug } = req.params;
    const artist = await artistDb.getArtistBySlug(artistSlug);
    return res.json({
      id: artist.id,
      name: artist.name,
      artwork: artist.image
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
 * Controller for the GET artists/[artistSlug]/data endpoint.
 * Returns complete streaming data about the artist with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtistData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { artistSlug } = req.params;
    const artist = await artistDb.getArtistBySlug(artistSlug);
    const topTracks = await artistService.getTopTracks(artist.id, 10);
    const topAlbums = await artistService.getTopAlbums(artist.id, 10);
    const topListeners = await artistService.getTopListeners(artist.id, 10);
    return res.json({
      id: artist.id,
      artistName: artist.name,
      artistSlug: artist.slug,
      artistArtwork: artist.image,
      topTracks: topTracks,
      topAlbums: topAlbums,
      topListeners: topListeners.map((user) => ({
        id: user.id,
        username: user.username,
        picture: `${config.domain}${user.picture}`,
        count: user.count
      }))
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
 * Controller for the GET artists/[artistId]/albums endpoint.
 * Returns the albums of the artist with the given Id.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtistAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { artistId } = req.params;
    // Validate artistId
    const artist = await artistDb.getArtistById(artistId);
    const artistAlbums = await albumDb.getAlbums({
      where: { artistId: artist.id }
    });
    return res.json({ albums: artistAlbums });
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
 * Controller for the GET artists/[artistId]/top-listeners endpoint.
 * Returns the top listeners of the artist with the given Id.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtistTopListeners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { artistId } = req.params;
    const topListeners = await artistService.getTopListeners(artistId, 10);
    return res.json({
      topListeners: topListeners.map((user) => ({
        id: user.id,
        username: user.username,
        picture: `${config.domain}${user.picture}`,
        count: user.count
      }))
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
