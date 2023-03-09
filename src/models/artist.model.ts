import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for Artist attributes.
 */
export interface IArtist {
  id: string;
  name: string;
  image: string;
}

/**
 * All attributes are requrired at model creation.
 */
type ArtistCreationAttributes = IArtist;

/**
 * Sequelize model definition for Artist table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<IArtist, ArtistCreationAttributes> => {
  const Artist = sequelize.define<Model<IArtist, ArtistCreationAttributes>>(
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
      }
    },
    {
      underscored: true
    }
  );
  return Artist;
};
