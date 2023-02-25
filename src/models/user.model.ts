import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for User attributes.
 */
interface UserAttributes {
  id: number;
  email: string;
  username: string;
  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  spotifyTokenExpires: Date;
  profileImage: string;
}

/**
 * All attributes are requrired at model creation
 */
type UserCreationAttributes = UserAttributes;

/**
 * User model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<UserAttributes, UserCreationAttributes> => {
  const User = sequelize.define<Model<UserAttributes, UserCreationAttributes>>(
    'User',
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      spotifyAccessToken: DataTypes.STRING,
      spotifyRefreshToken: DataTypes.STRING,
      spotifyTokenExpires: DataTypes.DATE,
      profileImage: DataTypes.STRING
    },
    {
      underscored: true
    }
  );
  return User;
};
