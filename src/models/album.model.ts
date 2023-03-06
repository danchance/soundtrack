import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Enum for album types returned by the Spotify API
 */
enum AlbumType {
  ALBUM = 'album',
  COMPILATION = 'compliation',
  SINGLE = 'single'
}

/**
 * Define interface for Album attributes.
 */
interface AlbumAttributes {
  id: string;
  name: string;
  type: AlbumType;
  trackNum: number;
  releaseYear: number;
  artwork: string;
}

/**
 * All attributes are requrired at model creation.
 */
type AlbumCreationAttributes = AlbumAttributes;

/**
 * Sequelize model definition for Album table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<AlbumAttributes, AlbumCreationAttributes> => {
  const Album = sequelize.define<
    Model<AlbumAttributes, AlbumCreationAttributes>
  >(
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
      }
    },
    {
      underscored: true
    }
  );
  return Album;
};
