import { Router } from 'express';
import * as artistController from '../controllers/artist.controller.js';
import getArtistDataSchema from '../validation_schemas/artist/get_artist_data.schema.js';
import validateRequest from '../middleware/validate_request.js';
import getArtistSchema from '../validation_schemas/artist/get_artist.schema.js';
import getArtistTopListenersSchema from '../validation_schemas/artist/get_artist_top_listeners.schema.js';
import getArtistAlbumsSchema from '../validation_schemas/artist/get_artist_albums.schema.js';

const router: Router = Router();

router.get(
  '/:artistSlug',
  getArtistSchema,
  validateRequest,
  artistController.getArtist
);

router.get(
  '/:artistSlug/data',
  getArtistDataSchema,
  validateRequest,
  artistController.getArtistData
);

router.get(
  '/:artistId/albums',
  getArtistAlbumsSchema,
  validateRequest,
  artistController.getArtistAlbums
);

router.get(
  '/:artistId/top-listeners',
  getArtistTopListenersSchema,
  validateRequest,
  artistController.getArtistTopListeners
);

export default router;
