import { Router } from 'express';
import * as albumController from '../controllers/album.controller.js';

const router: Router = Router();

router.get('/:albumSlug', albumController.getAlbum);

router.get('/:albumSlug/data', albumController.getAlbumData);

router.get('/:id/tracks', albumController.getAlbumTracks);

router.get('/:id/top-listeners', albumController.getAlbumTopListeners);

export default router;
