import {
  Sequelize,
  DataTypes,
  ModelDefined,
  Model,
  ForeignKey
} from 'sequelize';

/**
 * Define interface for Track attributes.
 */
interface TrackAttributes {
  id: string;
  name: string;
  duration: number;
  albumId: ForeignKey<string>;
}

/**
 * All attributes are requrired at model creation.
 */
type TrackCreationAttributes = TrackAttributes;

/**
 * Sequelize model definition for Track table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<TrackAttributes, TrackCreationAttributes> => {
  const Track = sequelize.define<
    Model<TrackAttributes, TrackCreationAttributes>
  >(
    'Track',
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
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      albumId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'albums',
          key: 'id'
        }
      }
    },
    {
      underscored: true
    }
  );
  return Track;
};
