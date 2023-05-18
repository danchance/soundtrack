import { FindAndCountOptions, FindOptions } from 'sequelize';
import { IUser } from '../models/user.model.js';
import { models } from '../models/_index.js';
import RecordNotFoundError from '../errors/record_not_found.error.js';

/**
 * Database functions used to manage all operations on User records.
 */
const userDb = (() => {
  /**
   * Adds a new user record to the User table.
   * @param user The user to create.
   * @returns The new user record.
   */
  const createUser = async (user: IUser): Promise<IUser> => {
    return (await models.user.create(user)).toJSON();
  };

  /**
   * Retrieves a user record by id.
   * @param userId Id of the user to retrieve.
   * @returns The requested user record.
   * @throws RecordNotFoundError if no user with the given Id exists.
   */
  const getUserById = async (userId: string): Promise<IUser> => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new RecordNotFoundError('User', `User not found.`);
    }
    return user.toJSON();
  };

  /**
   * Retrieves a user record that matches the query.
   * @param query Search query to execute.
   * @returns The requested user record.
   * @throws RecordNotFoundError if no user found.
   */
  const getUser = async (query: FindOptions<IUser>): Promise<IUser> => {
    const user = await models.user.findOne(query);
    if (user === null) {
      throw new RecordNotFoundError('User', `User not found.`);
    }
    return user.toJSON();
  };

  /**
   * Retrieves User records for the query and the number of records that
   * match the query.
   * @param query Search query to execute.
   * @returns The requested User records and record count.
   */
  const getUsers = async (
    query: FindAndCountOptions<IUser>
  ): Promise<{ count: number; rows: Array<IUser> }> => {
    const users = (await models.user.findAndCountAll({
      ...query,
      raw: true,
      nest: true
    })) as any;
    return users;
  };

  /**
   * Updates a user record in the User table.
   * @param userId The Id of the user to update.
   * @param updates The fields to update.
   * @returns The updated user record.
   * @throws RecordNotFoundError if no user with the given Id exists.
   */
  const updateUser = async (
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser> => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new RecordNotFoundError(
        'User',
        `User with ID ${userId} not found.`
      );
    }
    return (await user.update(updates)).toJSON();
  };

  /**
   * Deletes a user record from the User table.
   * @param userId The Id of the user to delete.
   * @throws RecordNotFoundError if no user with the given Id exists.
   */
  const deleteUser = async (userId: string) => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new RecordNotFoundError(
        'User',
        `User with ID ${userId} not found.`
      );
    }
    await user.destroy();
  };

  return {
    createUser,
    getUserById,
    getUser,
    getUsers,
    updateUser,
    deleteUser
  };
})();

export default userDb;
