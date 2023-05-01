import { NextFunction, Request, Response } from 'express';
import { RecordNotFoundError } from '../data_access/errors.js';
import trackDb from '../data_access/track.data.js';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import trackService from '../services/track.service.js';
import config from '../config/general.config.js';
import albumService from '../services/album.service.js';
import artistService from '../services/artist.service.js';

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
    // We only want 5 other albums, but the results may include the current
    // track, so we get 6 and filter out the current track if it exists.
    const otherTracks = await artistService.getArtistRandomTracks(artist.id, 6);
    return res.json({
      id: track.id,
      name: track.name,
      album: {
        id: album.id,
        name: album.name,
        artwork: album.artwork,
        trackNum: album.trackNum,
        releaseYear: album.releaseYear,
        duration: await albumService.getAlbumDuration(album.id),
        slug: album.slug
      },
      artist: {
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        artwork: artist.image
      },
      topListeners: topListeners.map((user) => ({
        id: user.id,
        username: user.username,
        picture: `${config.domain}${user.picture}`,
        count: user.count
      })),
      otherTracks: otherTracks.filter(
        (otherTrack) => otherTrack.id !== track.id
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
