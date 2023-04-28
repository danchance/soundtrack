import { NextFunction, Request, Response } from 'express';
import artistDb from '../data_access/artist.data.js';
import { RecordNotFoundError } from '../data_access/errors.js';
import artistService from '../services/artist.service.js';

/**
 * Controller for the GET artists/:artistSlug endpoint.
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
    const topTracks = await artistService.getTopTracks(artist.id, 10);
    const topAlbums = await artistService.getTopAlbums(artist.id, 10);
    const topListeners = await artistService.getTopListeners(artist.id, 10);
    return res.json({
      id: artist.id,
      artistName: artist.name,
      artistArtwork: artist.image,
      topTracks: topTracks,
      topAlbums: topAlbums,
      topListeners: topListeners
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
 * Controller for the GET artists/:id/albums endpoint.
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

/**
 * Controller for the GET artists/:id/top-listeners endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getArtistTopListeners = (
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
