import { Sequelize, DataTypes, ModelDefined, Model } from 'sequelize';

/**
 * Define interface for Track attributes.
 */
interface TrackAttributes {
  id: string;
  name: string;
  duration: number;
}

/**
 * All attributes are requrired at model creation
 */
type TrackCreationAttributes = TrackAttributes;

/**
 * Track model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<TrackAttributes, TrackCreationAttributes> => {
  const Track = sequelize.define<
    Model<TrackAttributes, TrackCreationAttributes>
  >(
    'track',
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
      }
    },
    {
      underscored: true
    }
  );
  return Track;
};
