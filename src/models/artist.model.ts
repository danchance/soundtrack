import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';
import slugify from '../utils/slugify.js';

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
      slug: DataTypes.STRING
    },
    {
      underscored: true
    }
  );

  Artist.addHook('beforeCreate', async (artist, options) => {
    artist.dataValues.slug = slugify(artist.dataValues.name);
  });

  Artist.addHook('beforeBulkCreate', async (artists, options) => {
    for (const artist of artists) {
      artist.dataValues.slug = slugify(artist.dataValues.name);
    }
  });

  return Artist;
};
