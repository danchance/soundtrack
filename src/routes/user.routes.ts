import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import checkJwt from '../middleware/auth.js';

const router: Router = Router();

router.get('/:userid', userController.getUser);

router.get('/:user/history', userController.getUserHistory);

router.get('/:userid/recap', userController.getUserRecap);

router.get('/:userid/discover', userController.getUserDiscover);

router.get('/:user/tracks', userController.getUserTracks);

router.get('/:user/albums', userController.getUserAlbums);

router.get('/:user/artists', userController.getUserArtists);

router.post('/add', userController.postUser);

router.post('/spotify/auth', checkJwt, userController.postSpotifyAuth);

export default router;
