import { Sequelize, DataTypes, ModelDefined, Model, Optional } from 'sequelize';

/**
 * Enum for the different timeframes for Top Tracks, Albums and Artists
 * on the users profile.
 */
enum Timeframe {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all'
}

/**
 * Enum for the different style types for Top Tracks, Albums and Artists
 * on the users profile.
 */
enum StyleType {
  LIST = 'list',
  GRID = 'grid',
  CHART = 'chart'
}

/**
 * Define interface for User attributes.
 */
export interface IUser {
  id: string;
  username: string;
  picture: string;
  privateProfile?: boolean;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyTokenExpires?: Date;
  topTracksTimeframe?: Timeframe;
  topTracksStyle?: StyleType;
  topAlbumsTimeframe?: Timeframe;
  topAlbumsStyle?: StyleType;
  topArtistsTimeframe?: Timeframe;
  topArtistsStyle?: StyleType;
  createdAt?: Date;
}

/**
 * Sequelize model definition for User table.
 */
export default (sequelize: Sequelize): ModelDefined<IUser, IUser> => {
  const User = sequelize.define<Model<IUser>>(
    'User',
    {
      id: {
        primaryKey: true,
        type: DataTypes.STRING
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false
      },
      privateProfile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      spotifyAccessToken: DataTypes.STRING,
      spotifyRefreshToken: DataTypes.STRING,
      spotifyTokenExpires: DataTypes.DATE,
      topTracksTimeframe: {
        type: DataTypes.ENUM(...Object.values(Timeframe)),
        defaultValue: Timeframe.ALL,
        allowNull: false
      },
      topTracksStyle: {
        type: DataTypes.ENUM(...Object.values(StyleType)),
        defaultValue: StyleType.LIST,
        allowNull: false
      },
      topAlbumsTimeframe: {
        type: DataTypes.ENUM(...Object.values(Timeframe)),
        defaultValue: Timeframe.ALL,
        allowNull: false
      },
      topAlbumsStyle: {
        type: DataTypes.ENUM(...Object.values(StyleType)),
        defaultValue: StyleType.GRID,
        allowNull: false
      },
      topArtistsTimeframe: {
        type: DataTypes.ENUM(...Object.values(Timeframe)),
        defaultValue: Timeframe.ALL,
        allowNull: false
      },
      topArtistsStyle: {
        type: DataTypes.ENUM(...Object.values(StyleType)),
        defaultValue: StyleType.GRID,
        allowNull: false
      }
    },
    {
      underscored: true
    }
  );
  return User;
};
