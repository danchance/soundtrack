import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';
import SequelizeSlugify from 'sequelize-slugify';

/**
 * Define interface for Artist attributes.
 */
export interface IArtist {
  id: string;
  name: string;
  image: string;
  slug?: string;
}

/**
 * Sequelize model definition for Artist table.
 */
export default (sequelize: Sequelize): ModelDefined<IArtist, IArtist> => {
  const Artist = sequelize.define<Model<IArtist>>(
    'Artist',
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
      image: {
        type: DataTypes.STRING,
        allowNull: false
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

  SequelizeSlugify.slugifyModel(Artist, {
    source: ['name']
  });

  return Artist;
};
