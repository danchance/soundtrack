import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import { join, dirname } from 'path';
import routes from './routes/_index.js';
import { fileURLToPath } from 'url';
import { sequelize } from './models/_index.js';
import checkUser from './middleware/user.js';

/**
 * Syncronize models with the database
 */
sequelize.sync();

const app: Express = express();

/**
 * Mount middleware used to serve static files.
 */
const root = dirname(fileURLToPath(import.meta.url));
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
 * CORS
 */
app.use(
  cors({
    origin: 'http://localhost:3000',
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
  return res.status(404).json({ ERROR: 'Not Found' });
});
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error.stack);
  return res.status(500).json({ ERROR: 'Internal server error' });
});

export default app;
