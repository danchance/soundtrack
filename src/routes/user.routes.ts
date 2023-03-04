import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import checkJwt from '../middleware/auth.js';

const router: Router = Router();

/**
 * Test protecting this route
 */
router.get('/:id', checkJwt, userController.getUser);

router.get('/:id/tracks/history', userController.getUserHistory);

router.get('/:id/tracks/top', userController.getUserTracksTop);

router.get('/:id/albums/top', userController.getUserAlbumsTop);

router.get('/:id/artists/top', userController.getUserArtistsTop);

export default router;
