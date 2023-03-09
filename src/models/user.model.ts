import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for User attributes.
 */
export interface IUser {
  id: number;
  username: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpires?: Date;
}

/**
 * All attributes are requrired at model creation.
 */
type UserCreationAttributes = IUser;

/**
 * Sequelize model definition for User table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<IUser, UserCreationAttributes> => {
  const User = sequelize.define<Model<IUser, UserCreationAttributes>>(
    'User',
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      spotifyAccessToken: DataTypes.STRING,
      spotifyRefreshToken: DataTypes.STRING,
      spotifyTokenExpires: DataTypes.DATE
    },
    {
      underscored: true
    }
  );
  return User;
};
