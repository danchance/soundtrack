import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for Genre attributes.
 */
export interface IGenre {
  id: string;
  name: string;
}

/**
 * All attributes are requrired at model creation.
 */
type GenreCreationAttributes = IGenre;

/**
 * Sequelize model definition for Genre table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<IGenre, GenreCreationAttributes> => {
  const Genre = sequelize.define<Model<IGenre, GenreCreationAttributes>>(
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
