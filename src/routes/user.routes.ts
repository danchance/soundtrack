import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router: Router = Router();

router.get('/:id', userController.getUser);

router.get('/:id/tracks/history', userController.getUserHistory);

router.get('/:id/tracks/top', userController.getUserTracksTop);

router.get('/:id/albums/top', userController.getUserAlbumsTop);

router.get('/:id/artists/top', userController.getUserArtistsTop);

export default router;
