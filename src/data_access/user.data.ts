import { IUser } from '../models/user.model';

const userDb = (() => {
  const createUser = async () => {};
  const getUserById = async (userId: string): Promise<IUser> => {
    return {
      id: 123,
      username: 'username',
      spotifyAccessToken: 'token1',
      spotifyRefreshToken: 'token1',
      spotifyTokenExpires: new Date(Date.now())
    };
  };
  const updateUser = async () => {};
  const deleteUser = async () => {};

  return {
    createUser,
    getUserById,
    updateUser,
    deleteUser
  };
})();

export default userDb;
