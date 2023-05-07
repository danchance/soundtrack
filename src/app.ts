import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { join, dirname } from 'path';
import routes from './routes/_index.js';
import { fileURLToPath } from 'url';
import { sequelize } from './models/_index.js';
import checkUser from './middleware/user.js';
import userDb from './data_access/user.data.js';

/**
 * Syncronize models with the database
 */
sequelize.sync({ force: true });

const app: Express = express();

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
    origin: ['http://127.0.0.1:3000', 'https://soundtrack.uk.auth0.com/'],
    credentials: true
  })
);

/**
 * Mount route middleware.
 */
app.use('/api', routes);

/**
 * Error reporting: 404 and 500.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({ ERROR: 'Resource Not Found' });
});
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  return res.status(500).json({ ERROR: 'Internal server error' });
});

export default app;
