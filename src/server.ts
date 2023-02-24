import { createServer } from 'http';
import app from './app.js';
import generalConfig from './config/general.config.js';

/**
 * Create and run Http Server.
 */
const server = createServer(app);

server.listen(generalConfig.serverPort);
server.on('listening', () => {
  console.log(
    `[server]: Server is running at http://localhost:${generalConfig.serverPort}`
  );
});
