import { Router } from 'express';
import * as trackController from '../controllers/track.controller.js';
import getTrackDataSchema from '../validation_schemas/track/get_track_data.schema.js';
import validateRequest from '../middleware/validate_request.js';
import getTrackSchema from '../validation_schemas/track/get_track.schema.js';

const router: Router = Router();

router.get(
  '/:trackSlug',
  getTrackSchema,
  validateRequest,
  trackController.getTrack
);

router.get(
  '/:trackSlug/data',
  getTrackDataSchema,
  validateRequest,
  trackController.getTrackData
);

export default router;
