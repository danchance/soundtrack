import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for Genre attributes.
 */
interface GenreAttributes {
  id: string;
  name: string;
}

/**
 * All attributes are requrired at model creation
 */
type GenreCreationAttributes = GenreAttributes;

/**
 * Genre model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<GenreAttributes, GenreCreationAttributes> => {
  const Genre = sequelize.define<
    Model<GenreAttributes, GenreCreationAttributes>
  >(
    'Genre',
    {
      id: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );
  return Genre;
};
