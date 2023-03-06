import { IUser } from '../models/user.model';
import { models } from '../models/_index.js';

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
   * @throws If no user with the given Id exists.
   */
  const getUserById = async (userId: string): Promise<IUser> => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    return user.toJSON();
  };

  /**
   * Updates a user record in the User table.
   * @param userId The Id of the user to update.
   * @param updates The fields to update.
   * @returns The updated user record.
   * @throws If no user with the given Id exists.
   */
  const updateUser = async (
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser> => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    return (await user.update(updates)).toJSON();
  };

  /**
   * Deletes a user record from the User table.
   * @param userId The Id of the user to delete.
   * @throws If no user with the given Id exists.
   */
  const deleteUser = async (userId: string) => {
    const user = await models.user.findByPk(userId);
    if (user === null) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    await user.destroy();
  };

  return {
    createUser,
    getUserById,
    updateUser,
    deleteUser
  };
})();

export default userDb;
