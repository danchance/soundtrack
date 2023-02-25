import { Router } from 'express';
import trackRouter from './track.routes.js';
import albumRouter from './album.routes.js';
import artistRouter from './artist.routes.js';
import userRouter from './user.routes.js';

const router: Router = Router();

router.use('/tracks', trackRouter);
router.use('/album', albumRouter);
router.use('/artist', artistRouter);
router.use('/user', userRouter);

export default router;
