/**
 * NOTE: A separate file that executes config is required to ensure
 * environment variables are loaded first before any other module.
 */
import * as dotenv from 'dotenv';

/**
 * Do not load environment variables from .env file in production.
 */
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
