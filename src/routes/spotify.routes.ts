import { Router } from 'express';
import * as spotifyController from '../controllers/spotify.controller.js';
import checkJwt from '../middleware/auth.js';

const router: Router = Router();

router.post('/authorize', checkJwt, spotifyController.authorize);

export default router;
