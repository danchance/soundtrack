import { Router } from 'express';
import * as trackController from '../controllers/track.controller.js';

const router: Router = Router();

router.get('/:trackSlug', trackController.getTrack);

export default router;
