import { NextFunction, Request, Response } from 'express';
import { RecordNotFoundError } from '../data_access/errors.js';
import trackDb from '../data_access/track.data.js';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import trackService from '../services/track.service.js';
import config from '../config/general.config.js';

/**
 * Controller for the GET tracks/:trackSlug endpoint.
 * Returns general information about the track with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackSlug } = req.params;
    const track = await trackDb.getTrackBySlug(trackSlug);
    const album = await albumDb.getAlbumById(track.albumId);
    const artist = await artistDb.getArtistById(album.artistId!);
    return res.json({
      id: track.id,
      name: track.name,
      artwork: album.artwork,
      duration: track.duration,
      albumName: album.name,
      albumSlug: album.slug,
      artistName: artist.name,
      artistSlug: artist.slug
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
 * Controller for the GET tracks/:trackSlug endpoint.
 * Returns complete streaming data about the track with the given slug.
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware function
 */
export const getTrackData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackSlug } = req.params;
    const track = await trackDb.getTrackBySlug(trackSlug);
    const album = await albumDb.getAlbumById(track.albumId);
    const artist = await artistDb.getArtistById(album.artistId!);
    const topListeners = await trackService.getTopListeners(track.id, 10);
    return res.json({
      id: track.id,
      trackName: track.name,
      duration: track.duration,
      albumName: album.name,
      albumArtwork: album.artwork,
      albumSlug: album.slug,
      artistName: artist.name,
      artistArtwork: artist.image,
      artistSlug: artist.slug,
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
