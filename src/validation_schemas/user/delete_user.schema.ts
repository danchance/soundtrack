import { checkSchema } from 'express-validator';

/**
 * Validation schema for the DELETE users/[userId] endpoint.
 */
const deleteUserSchema = checkSchema({
  userId: {
    in: ['params'],
    trim: true,
    escape: true,
    custom: {
      options: async (userId: string, { req }) => {
        if (userId !== req.user.id) {
          throw new Error('You do not have permission to delete this user.');
        }
        return true;
      }
    }
  }
});

export default deleteUserSchema;
