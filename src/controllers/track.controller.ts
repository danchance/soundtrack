import { NextFunction, Request, Response } from 'express';
import { RecordNotFoundError } from '../data_access/errors.js';
import trackDb from '../data_access/track.data.js';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import trackService from '../services/track.service.js';

/**
 * Controller for the GET tracks/:trackSlug endpoint.
 * Returns information about a track
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
