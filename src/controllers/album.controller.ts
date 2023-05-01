import { NextFunction, Request, Response } from 'express';
import { RecordNotFoundError } from '../data_access/errors.js';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import albumService from '../services/album.service.js';
import config from '../config/general.config.js';
import artistService from '../services/artist.service.js';

/**
 * Controller for the GET albums/:albumSlug endpoint.
 * Returns general information about the album with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { albumSlug } = req.params;
    const album = await albumDb.getAlbumBySlug(albumSlug);
    const artist = await artistDb.getArtistById(album.artistId!);
    const albumDuration = await albumService.getAlbumDuration(album.id);
    return res.json({
      id: album.id,
      name: album.name,
      artwork: album.artwork,
      releaseYear: album.releaseYear,
      trackNum: album.trackNum,
      artistName: artist.name,
      artistSlug: artist.slug,
      duration: albumDuration
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
 * Controller for the GET albums/:albumSlug/data endpoint.
 * Returns complete streaming data about the album with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getAlbumData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { albumSlug } = req.params;
    const album = await albumDb.getAlbumBySlug(albumSlug);
    const artist = await artistDb.getArtistById(album.artistId!);
    const albumTracks = await albumService.getAlbumTracks(album.id);
    const topListeners = await albumService.getTopListeners(album.id, 10);
    // We want to display 6 other albums, so we get 7 and filter out the
    // current album if it exists.
    const otherAlbums = await artistService.getArtistAlbums(artist.id, 7);
    return res.json({
      id: album.id,
      albumName: album.name,
      albumSlug: album.slug,
      albumArtwork: album.artwork,
      artistName: artist.name,
      artistArtwork: artist.image,
      artistSlug: artist.slug,
      albumTracks: albumTracks,
      topListeners: topListeners.map((user) => ({
        id: user.id,
        username: user.username,
        picture: `${config.domain}${user.picture}`,
        count: user.count
      })),
      otherAlbums: otherAlbums.filter(
        (otherAlbum) => otherAlbum.id !== album.id
      )
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
 * Controller for the GET albums/:id/tracks endpoint.
 * Returns all tracks belonging to an album.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getAlbumTracks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const album = await albumDb.getAlbumById(req.params.id);
    const albumTracks = await albumService.getAlbumTracks(album.id);
    return res.json({ albumId: album.id, albumTracks: albumTracks });
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
 * Controller for the GET albums/:id/top-listeners endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getAlbumTopListeners = (
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
