import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Enum for album types returned by the Spotify API
 */
export enum AlbumType {
  ALBUM = 'album',
  COMPILATION = 'compilation',
  SINGLE = 'single'
}

/**
 * Define interface for Album attributes.
 */
export interface IAlbum {
  id: string;
  name: string;
  type: AlbumType;
  trackNum: number;
  releaseYear: number;
  artwork: string;
  artistId?: string;
}

/**
 * All attributes are requrired at model creation.
 */
type AlbumCreationAttributes = IAlbum;

/**
 * Sequelize model definition for Album table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<IAlbum, AlbumCreationAttributes> => {
  const Album = sequelize.define<Model<IAlbum, AlbumCreationAttributes>>(
    'Album',
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
      type: {
        type: DataTypes.ENUM(...Object.values(AlbumType)),
        allowNull: false
      },
      trackNum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      releaseYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          isValidYear(value: number) {
            const currentYear = new Date().getFullYear();
            return value <= currentYear;
          }
        }
      },
      artwork: {
        type: DataTypes.STRING,
        allowNull: false
      },
      artistId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'artists',
          key: 'id'
        }
      }
    },
    {
      underscored: true
    }
  );
  return Album;
};
