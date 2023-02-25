import {
  Sequelize,
  DataTypes,
  ModelDefined,
  Model,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize';

/**
 * Define interface for Track attributes.
 */
interface TrackModel
  extends Model<
    InferAttributes<TrackModel>,
    InferCreationAttributes<TrackModel>
  > {
  trackId: string;
  name: string;
  length: number;
}

/**
 * Track model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<
  InferAttributes<TrackModel>,
  InferCreationAttributes<TrackModel>
> => {
  const Track = sequelize.define<TrackModel>(
    'track',
    {
      trackId: {
        primaryKey: true,
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      length: {
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
