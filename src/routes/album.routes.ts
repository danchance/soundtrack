import { Router } from 'express';
import * as albumController from '../controllers/album.controller.js';

const router: Router = Router();

router.get('/:id', albumController.getAlbum);

router.get('/:id/tracks', albumController.getAlbumTracks);

export default router;
