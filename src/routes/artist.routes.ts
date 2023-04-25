import { Router } from 'express';
import * as artistController from '../controllers/artist.controller.js';

const router: Router = Router();

router.get('/:artistSlug', artistController.getArtist);

router.get('/:artistSlug/albums', artistController.getArtistAlbums);

router.get(
  '/:artistSlug/top-listeners',
  artistController.getArtistTopListeners
);

export default router;
