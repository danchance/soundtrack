import { Router } from 'express';
import * as trackController from '../controllers/track.controller.js';

const router: Router = Router();

router.get('/:id', trackController.getTrack);

export default router;
