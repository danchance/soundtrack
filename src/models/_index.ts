import { devdb } from '../config/db.config.js';
import { Sequelize } from 'sequelize';
import albumModel from './album.model.js';
import trackModel from './track.model.js';
import artistModel from './artist.model.js';
import genreModel from './genre.model.js';
import usertrackhistoryModel from './usertrackhistory.model.js';
import userModel from './user.model.js';

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
    // logging: false
  }
);

/**
 * Define database models.
 */
const models = {
  user: userModel(sequelize),
  genre: genreModel(sequelize),
  artist: artistModel(sequelize),
  album: albumModel(sequelize),
  track: trackModel(sequelize),
  userTrackHistory: usertrackhistoryModel(sequelize)
};

/**
 * Setup Track model associations.
 *  - AlbumId foreign key: many-to-one.
 *  - TrackArtists junction table: many-to-many.
 */
models.album.hasMany(models.track, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
models.track.belongsTo(models.album);

models.track.belongsToMany(models.artist, { through: 'TrackArtists' });
models.artist.belongsToMany(models.track, { through: 'TrackArtists' });

/**
 * Setup Album model associations.
 *  - ArtistId foreign key: many-to-one.
 *  - AlbumGenres junction table: many-to-many
 */
models.artist.hasMany(models.album, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
models.album.belongsTo(models.artist);

models.album.belongsToMany(models.genre, { through: 'AlbumGenres' });
models.genre.belongsToMany(models.album, { through: 'AlbumGenres' });

/**
 * Setup Artist model associations.
 *  - ArtistGenres junction table: many-to-many.
 */
models.artist.belongsToMany(models.genre, { through: 'ArtistGenres' });
models.genre.belongsToMany(models.artist, { through: 'ArtistGenres' });

/**
 * Setup UserTrackHistory model associations.
 *  - UserId foreign key: many-to-one.
 *  - TrackId foreign key: many-to-one.
 */
models.user.hasMany(models.userTrackHistory, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
models.userTrackHistory.belongsTo(models.user);

models.track.hasMany(models.userTrackHistory, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
models.userTrackHistory.belongsTo(models.track);

export { sequelize, models };
