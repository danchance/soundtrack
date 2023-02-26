import { Router } from 'express';
import * as artistController from '../controllers/artist.controller.js';

const router: Router = Router();

router.get('/:id', artistController.getArtist);

router.get('/:id/albums', artistController.getArtistAlbums);

export default router;
