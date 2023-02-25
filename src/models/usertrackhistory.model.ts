import {
  Sequelize,
  DataTypes,
  ModelDefined,
  Model,
  ForeignKey
} from 'sequelize';

/**
 * Define interface for UserTrackHistory attributes.
 */
interface UserTrackHistoryAttributes {
  id: number;
  userId: ForeignKey<number>;
  trackId: ForeignKey<string>;
  playedAt: string;
}

/**
 * All attributes are requrired at model creation
 */
type UserTrackHistoryCreationAttributes = UserTrackHistoryAttributes;

/**
 * UserTrackHistory model definition.
 */
export default (
  sequelize: Sequelize
): ModelDefined<
  UserTrackHistoryAttributes,
  UserTrackHistoryCreationAttributes
> => {
  const UserTrackHistory = sequelize.define<
    Model<UserTrackHistoryAttributes, UserTrackHistoryCreationAttributes>
  >(
    'UserTrackHistory',
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // references: {
        //   model: 'users',
        //   key: 'id'
        // }
      },
      trackId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'tracks',
          key: 'id'
        }
      },
      playedAt: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: false
    }
  );
  return UserTrackHistory;
};
