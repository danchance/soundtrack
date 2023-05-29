import { checkSchema } from 'express-validator';

/**
 * Validation schema for the POST users/add endpoint.
 */
const postUserSchema = checkSchema({
  id: {
    in: ['body'],
    trim: true,
    custom: {
      options: async (id: string) => {
        if (id.substring(0, 6) === 'auth0|') {
          return true;
        }
        throw new Error('Invalid id');
      }
    },
    escape: true,
    notEmpty: true
  },
  username: {
    in: ['body'],
    trim: true,
    escape: true,
    toLowerCase: true,
    notEmpty: true,
    isLength: {
      options: { min: 3, max: 15 },
      errorMessage: 'Username must be between 3 and 15 characters long.'
    },
    matches: {
      options: /^[a-z0-9@^$.!`\-\#+'~_]+$/,
      errorMessage:
        "Username can only contain alphanumeric characters and: @^$.!`-#+'~_"
    }
  },
  email: {
    in: ['body'],
    trim: true,
    escape: true,
    notEmpty: true
  }
});

export default postUserSchema;
