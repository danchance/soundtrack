import { Router } from 'express';
import * as albumController from '../controllers/album.controller.js';
import getAlbumsTopListenersSchema from '../validation_schemas/album/get_album_top_listeners.schema.js';
import validateRequest from '../middleware/validate_request.js';
import getAlbumsTracksSchema from '../validation_schemas/album/get_album_tracks.schema.js';
import getAlbumsDataSchema from '../validation_schemas/album/get_album_data.schema.js';
import getAlbumSchema from '../validation_schemas/album/get_album.schema.js';

const router: Router = Router();

router.get(
  '/:albumSlug',
  getAlbumSchema,
  validateRequest,
  albumController.getAlbum
);

router.get(
  '/:albumSlug/data',
  getAlbumsDataSchema,
  validateRequest,
  albumController.getAlbumData
);

router.get(
  '/:albumId/tracks',
  getAlbumsTracksSchema,
  validateRequest,
  albumController.getAlbumTracks
);

router.get(
  '/:albumId/top-listeners',
  getAlbumsTopListenersSchema,
  validateRequest,
  albumController.getAlbumTopListeners
);

export default router;
