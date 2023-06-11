import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { join, dirname } from 'path';
import routes from './routes/_index.js';
import { fileURLToPath } from 'url';
import { sequelize } from './models/_index.js';
import checkUser from './middleware/user.js';
import userDb from './data_access/user.data.js';
import BadRequestError from './errors/bad_request.error.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cron from 'node-cron';
import updateStreamHistoryJob from './jobs/user_streaming_history.job.js';

/**
 * Syncronize models with the database
 */
sequelize.sync();

/**
 * Schedule cron jobs. Jobs:
 *  1) Update user streaming history (every 10 minutes).
 */
cron.schedule(
  updateStreamHistoryJob.CRON_EXPRESSION,
  updateStreamHistoryJob.task
);

const app: Express = express();

/**
 * Mount rate limiting middleware.
 * Requests to the api are limited to 150/minute
 */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

/**
 * Mount helmet middleware to set HTTP response headers.
 */
app.use(helmet());

/**
 * Mount middleware used to serve static files.
 */
const root = dirname(fileURLToPath(import.meta.url)).slice(0, -5);
app.use(express.static(join(root, 'public')));

/**
 * Mount body-parsing middleware.
 */
app.use(express.json());

/**
 * Mount user middleware, to attach a user object to the request object
 * if a verified JWT was included in the request.
 */
app.use(checkUser);

/**
 * In production Auth0 will POST new users who sign up to the soundtrack
 * database, however this does not occur in development, as the dev
 * server is run locally. Instead in development we use the Auth0 signed
 * access token to check if the user exists in the soundtrack database
 * and if not add them.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined) return next();
    try {
      await userDb.createUser({
        id: req.user.id,
        username: req.user.username,
        picture: '/images/test/koala.jpg',
        bannerPicture: '/images/test/space.jpg'
      });
    } catch (error) {
      // Catch and ignore all errors in this situation.
      // UniqueContraintError usually thrown.
    }
    return next();
  });
}

/**
 * CORS
 */
app.use(
  cors({
    origin: [
      'http://127.0.0.1:3000',
      'https://soundtrack.uk.auth0.com/',
      'https://mysoundtrack.dev'
    ],
    credentials: true
  })
);

/**
 * Mount route middleware.
 */
app.use('/api', routes);

/**
 * Error reporting:
 *  - No matching route (404)
 *  - Validation errors (400)
 *  - Internal server errors (500)
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  return res
    .status(404)
    .json({ error: { status: 404, message: 'Resource Not Found' } });
});
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof BadRequestError) {
    return res.status(400).json({
      error: {
        status: 400,
        error: error.errors
      }
    });
  }
  return res.status(500).json({
    error: {
      status: 500,
      error: 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : {}
    }
  });
});

export default app;
