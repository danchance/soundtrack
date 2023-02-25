import { devdb } from '../config/db.config.js';
import { Sequelize } from 'sequelize';
import albumModel from './album.model.js';
import trackModel from './track.model.js';
import artistModel from './artist.model.js';

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
const models = {
  artist: artistModel(sequelize),
  album: albumModel(sequelize),
  track: trackModel(sequelize)
};

/**
 * Setup Track model associations.
 *  - AlbumId foreign key: many-to-one.
 *  - TrackArtists junction table: many-to-many.
 */
models.album.hasMany(models.track);
// models.track.belongsTo(models.album);

models.track.belongsToMany(models.artist, { through: 'TrackArtists' });
models.artist.belongsToMany(models.track, { through: 'TrackArtists' });

/**
 * Setup Album model associations.
 *  - AlbumArtists junction table: many-to-many.
 *  - AlbumGenres junction table: many-to-many
 */
models.album.belongsToMany(models.artist, { through: 'AlbumArtists' });
models.artist.belongsToMany(models.album, { through: 'AlbumArtists' });

// models.album.belongsToMany(models.genre, {through: 'AlbumGenres'})
// models.genre.belongsToMany(models.album, {through: 'AlbumGenres'})

/**
 * Setup Artist model associations.
 *  - ArtistGenres junction table: many-to-many.
 */
// models.artist.belongsToMany(models.genre, {through: 'ArtistGenres'})
// models.genre.belongsToMany(models.artist, {through: 'ArtistGenres'})

export { sequelize, models };
