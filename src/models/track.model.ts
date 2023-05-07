import {
  Sequelize,
  DataTypes,
  ModelDefined,
  Model,
  ForeignKey
} from 'sequelize';
import SequelizeSlugify from 'sequelize-slugify';

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
      slug: {
        type: DataTypes.STRING,
        unique: true
      }
    },
    {
      underscored: true
    }
  );

  SequelizeSlugify.slugifyModel(Track, {
    source: ['name']
  });

  return Track;
};
