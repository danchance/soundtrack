import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import checkJwt from '../middleware/auth.js';
import fileupload from 'express-fileupload';

const router: Router = Router();

router.get('/settings', checkJwt, userController.getUserSettings);

router.patch('/settings', checkJwt, userController.patchUserSettings);

router.post(
  '/profile-picture',
  checkJwt,
  fileupload(),
  userController.postProfilePicture
);

router.post(
  '/banner-picture',
  checkJwt,
  fileupload(),
  userController.postBannerImage
);

router.post('/add', userController.postUser);

router.post('/spotify', checkJwt, userController.postSpotifyConnection);

router.delete('/spotify', checkJwt, userController.deleteSpotifyConnection);

router.get('/:user/info', userController.getUserInfo);

router.get('/:user/track-history', userController.getUserTrackHistory);

router.get('/:userid/recap', userController.getUserRecap);

router.get('/:userid/discover', userController.getUserDiscover);

router.get('/:user/tracks', userController.getUserTracks);

router.get('/:user/albums', userController.getUserAlbums);

router.get('/:user/artists', userController.getUserArtists);

router.get('/:userid/current-track', userController.getUserCurrentTrack);

router.delete('/:userid', checkJwt, userController.deleteUser);

export default router;
