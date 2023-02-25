import { devdb } from '../config/db.config.js';
import { Sequelize } from 'sequelize';

/**
 * Setup database connection
 */
const sequelize = new Sequelize(devdb.DB, devdb.USER, devdb.PASSWORD, {
  host: devdb.HOST,
  port: devdb.PORT,
  dialect: 'mysql',
  pool: {
    max: devdb.pool.max,
    min: devdb.pool.min,
    acquire: devdb.pool.acquire,
    idle: devdb.pool.idle
  }
});

const db = {
  Sequelize: Sequelize,
  sequelize: sequelize
};

export default db;
