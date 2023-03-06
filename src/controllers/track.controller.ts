import { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';
import spotifyApi from '../data_access/spotify.data.js';
import userDb from '../data_access/user.data.js';

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
    // const accessToken =
    //   'BQC44W6iWJtFSV9Kl3w_J0gPKKhfQ6FkKS-wyfaURSwMnZsRF3ACt4lLY1a64fshCc5SiOQQgkEpC5pK24Dx9dxwtvpG0lZ7UHfpwZlzrAK9RNbgbGGK_7lWJDlrLkbX_MKgms09J1_WkFhOzFSTYsr2AGWEE2TfPiG5bFh-fv6X5uXwDJPoIx7yMf8';
    // const trackId = '5kqIPrATaCc2LqxVWzQGbk';
    // const data = await spotifyApi.getTrack(accessToken, trackId);
    // const data = await spotifyApi.getRecentlyPlayed(accessToken, 1, 30);
    // const data = await spotifyApi.getCurrentlyPlayingTrack(accessToken);
    console.log(
      await userDb.createUser({
        id: 1234,
        username: 'username2',
        spotifyAccessToken: 'token1',
        spotifyRefreshToken: 'token1',
        spotifyTokenExpires: new Date(Date.now())
      })
    );
    // userDb.getUserById('123');
    console.log(await userDb.updateUser('123', { username: 'username2' }));
    return res.json({});
  } catch (error) {
    console.log('--------------ERROR--------------');
    if (error instanceof UniqueConstraintError) {
      if (error.errors[0].path === 'username') {
        console.log('duplicate username');
      }
      if (error.errors[0].path === 'PRIMARY') {
        console.log('duplicate id');
      }
    } else {
      console.error(error);
    }
    return res.json({ error });
  }
};
