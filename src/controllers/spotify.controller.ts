import { NextFunction, Request, Response } from 'express';
import spotifyApi from '../data_access/spotify.data.js';
// import spotifyAuthService from '../services/spotify/auth.js';

/**
 * Controller for the tracks/:id endpoint.
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() middleware function
 */
export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await spotifyApi.requestAccessToken(
      req.body.code,
      req.body.redirectUri
    );
    // await spotifyApi.requestRefreshedAccessToken(
    //   'AQADM5i1bWmto9JRvR1zs9Efh-qiXxxR_815pA4m_Cms9OoXbjCeGJ9v991jXIaSG5vBs3s9OhUH8ZVIbtAzVwqnaZFfo5mDgDQlmxk9AALlLEcd5pSLHa75u1OEhqacMQ0'
    // );
    return res.json({ ...data });
  } catch (error) {
    console.log('--------------ERROR--------------');
    console.error(error);
    return res.json({ error });
  }
};
