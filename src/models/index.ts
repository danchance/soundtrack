import { devdb } from '../config/db.config.js';
import { Sequelize } from 'sequelize';
import trackModel from './track.model.js';
import albumModel from './album.model.js';

/**
 * Setup database connection.
 */
const sequelize: Sequelize = new Sequelize(
  devdb.DB,
  devdb.USER,
  devdb.PASSWORD,
  {
    host: devdb.HOST,
    port: devdb.PORT,
    dialect: 'mysql',
    pool: {
      max: devdb.pool.max,
      min: devdb.pool.min,
      acquire: devdb.pool.acquire,
      idle: devdb.pool.idle
    }
  }
);

/**
 * Define database models.
 */
const db = {
  sequelize: sequelize,
  tracks: trackModel(sequelize),
  albums: albumModel(sequelize)
};

export default db;
