import { Router } from 'express';
import trackRouter from './track.routes.js';
import albumRouter from './album.routes.js';
import artistRouter from './artist.routes.js';
import userRouter from './user.routes.js';

const router: Router = Router();

router.use('/tracks', trackRouter);
router.use('/albums', albumRouter);
router.use('/artists', artistRouter);
router.use('/users', userRouter);

export default router;
