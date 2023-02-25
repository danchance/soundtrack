import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router: Router = Router();

router.get('/:id', userController.getUser);

export default router;
