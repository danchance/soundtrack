import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import checkJwt from '../middleware/auth.js';

const router: Router = Router();

router.get('/:id', userController.getUser);

router.get('/:id/history', userController.getUserHistory);

router.get('/:id/recap', userController.getUserRecap);

router.get('/:id/discover', userController.getUserDiscover);

router.get('/:id/tracks', userController.getUserTracks);

router.get('/:id/albums', userController.getUserAlbums);

router.get('/:id/artists', userController.getUserArtists);

router.post('/add', userController.postUser);

router.post('/spotify/auth', checkJwt, userController.postSpotifyAuth);

export default router;
