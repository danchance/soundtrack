import { NextFunction, Request, Response } from 'express';
import { RecordNotFoundError } from '../data_access/errors.js';
import trackDb from '../data_access/track.data.js';

/**
 * Controller for the GET tracks/:trackSlug endpoint.
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
    return res.json({ id: track.id, name: track.name });
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
