import {
  Sequelize,
  DataTypes,
  ModelDefined,
  Model,
  ForeignKey
} from 'sequelize';
import slugify from '../utils/slugify.js';

/**
 * Define interface for Track attributes.
 */
export interface ITrack {
  id: string;
  name: string;
  duration: number;
  albumId: ForeignKey<string>;
  slug?: string;
}

/**
 * Sequelize model definition for Track table.
 */
export default (sequelize: Sequelize): ModelDefined<ITrack, ITrack> => {
  const Track = sequelize.define<Model<ITrack>>(
    'Track',
    {
      id: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      albumId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'albums',
          key: 'id'
        }
      },
      slug: DataTypes.STRING
    },
    {
      underscored: true
    }
  );

  Track.addHook('beforeCreate', async (track, options) => {
    track.dataValues.slug = slugify(track.dataValues.name);
  });

  Track.addHook('beforeBulkCreate', async (tracks, options) => {
    for (const track of tracks) {
      track.dataValues.slug = slugify(track.dataValues.name);
    }
  });

  return Track;
};
