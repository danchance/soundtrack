import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for Artist attributes.
 */
interface ArtistAttributes {
  id: string;
  name: string;
  image: string;
}

/**
 * All attributes are requrired at model creation
 */
type ArtistCreationAttributes = ArtistAttributes;

/**
 * Artist model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<ArtistAttributes, ArtistCreationAttributes> => {
  const Artist = sequelize.define<
    Model<ArtistAttributes, ArtistCreationAttributes>
  >(
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
