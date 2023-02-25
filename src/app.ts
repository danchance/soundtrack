import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import routes from './routes/_routes.js';
import { fileURLToPath } from 'url';
import db from './models/index.js';

/**
 * Do not load environment variables from .env file in production.
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

/**
 * Syncronize models with the database
 */
db.sequelize.sync();

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
