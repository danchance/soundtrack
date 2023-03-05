import { NextFunction, Request, Response } from 'express';
import spotifyApi from '../data_access/spotify.data.js';

/**
 * Controller for the tracks/:id endpoint.
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
    const accessToken =
      'BQCNKplqS6CQhQmfZmixB-9NfRf2Fh2ksh4L-2ORwDTAwaAxZVsfzVYkNEmZ74f9H9R4ncCOqBFChFY0z80lAmuG7p20EUwww-qkGjhIFScig6RCLo98x3fAYlU8dBXECDztTNIr7nWaKmpLl1unKRApEVOjwcj9JKYh1FlDaOtVCq-yIe8ElSf3r2M';
    const trackId = '5kqIPrATaCc2LqxVWzQGbk';
    const data = await spotifyApi.getTrack(accessToken, trackId);
    return res.json({ data });
  } catch (error) {
    console.log('--------------ERROR--------------');
    console.error(error);
    return res.json({ error });
  }
};
