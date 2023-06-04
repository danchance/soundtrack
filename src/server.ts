import './utils/env.js';
import generalConfig from './config/general.config.js';
import { createServer } from 'http';
import app from './app.js';

/**
 * Create and run Http Server.
 */
const server = createServer(app);

server.listen(generalConfig.serverPort);
server.on('listening', () => {
  console.log(`[server]: Server is running at ${generalConfig.domain}`);
});
