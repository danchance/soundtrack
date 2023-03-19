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
export interface IUserTrackHistory {
  id?: number;
  userId: ForeignKey<string>;
  // trackId: ForeignKey<string>;
  trackId: string;
  playedAt: Date;
}

/**
 * All attributes are requrired at model creation.
 */
type UserTrackHistoryCreationAttributes = IUserTrackHistory;

/**
 * Sequelize model definition for UserTrackHistory table.
 */
export default (
  sequelize: Sequelize
): ModelDefined<IUserTrackHistory, UserTrackHistoryCreationAttributes> => {
  const UserTrackHistory = sequelize.define<
    Model<IUserTrackHistory, UserTrackHistoryCreationAttributes>
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
        unique: 'compositeKey',
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      // trackId: {
      //   type: DataTypes.STRING,
      //   unique: 'compositeKey',
      //   allowNull: false,
      //   references: {
      //     model: 'tracks',
      //     key: 'id'
      //   }
      // },
      trackId: {
        type: DataTypes.STRING,
        unique: 'compositeKey',
        allowNull: false
      },
      playedAt: {
        type: DataTypes.DATE,
        unique: 'compositeKey',
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
