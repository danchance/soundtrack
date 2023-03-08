import { IUserTrackHistory } from '../models/usertrackhistory.model.js';
import { models } from '../models/_index.js';
import { RecordNotFoundError } from './errors.js';
import { DestroyOptions, FindAndCountOptions } from 'sequelize';

/**
 * Database functions used to manage all operations on UserTrack records.
 */
const userTrackHistoryDB = (() => {
  /**
   * Adds a new UserTrack record to the UserTrackHistory table.
   * @param userTrack The UserTrack to create.
   * @returns The new UserTrack record.
   */
  const createUserTrack = async (
    userTrack: IUserTrackHistory
  ): Promise<IUserTrackHistory> => {
    return (await models.userTrackHistory.create(userTrack)).toJSON();
  };

  /**
   * Adds multiple UserTrack records to the UserTrackHistory table.
   * @param userTracks Array of UserTrack to create.
   * @returns
   */
  const bulkCreateUserTracks = async (userTracks: Array<IUserTrackHistory>) => {
    return await models.userTrackHistory.bulkCreate(userTracks, {
      validate: true
    });
  };

  /**
   * Retrieves UserTrack records for the query and the number of records that
   * match the query.
   * @param query Search query to execute.
   * @returns The requested UserTrack records and record count.
   * @throws RecordNotFoundError if no UserTrack records exist.
   */
  const getUserTracks = async (
    query: FindAndCountOptions<IUserTrackHistory>
  ) => {
    const userTracks = await models.userTrackHistory.findAndCountAll(query);
    if (userTracks === null) {
      throw new RecordNotFoundError(
        'UserTrack',
        `No UserTracks for query: ${query}  found`
      );
    }
    return userTracks;
  };

  /**
   * Deletes all userTrack records that satisfy the query.
   * @param query Query to delete records.
   */
  const deleteUserTracks = async (query: DestroyOptions<IUserTrackHistory>) => {
    await models.userTrackHistory.destroy(query);
  };

  return {
    createUserTrack,
    bulkCreateUserTracks,
    getUserTracks,
    deleteUserTracks
  };
})();

export default userTrackHistoryDB;
