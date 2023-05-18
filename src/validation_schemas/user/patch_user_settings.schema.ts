import { checkSchema } from 'express-validator';
import { styleSchema, timeframeSchema } from '../common.schema.js';
import userDb from '../../data_access/user.data.js';

/**
 * Validation schema for the PATCH users/settings endpoint.
 */
const patchUserSettingsSchema = checkSchema({
  username: {
    in: ['body'],
    optional: true,
    trim: true,
    escape: true,
    toLowerCase: true,
    isLength: {
      options: { min: 3, max: 15 },
      errorMessage: 'Username must be between 3 and 15 characters long.'
    },
    matches: {
      options: /^[a-z0-9@^$.!`\-\#+'~_]+$/,
      errorMessage:
        "Username can only contain alphanumeric characters and: @^$.!`-#+'~_"
    },
    custom: {
      options: async (username: string) => {
        try {
          await userDb.getUser({ where: { username } });
        } catch (error) {
          // getUser throws an error if the user is not found.
          return true;
        }
        throw new Error('Username is already taken.');
      }
    }
  },
  password: {
    in: ['body'],
    optional: true,
    trim: true,
    escape: true,
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be atleast 8 characters.'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      errorMessage:
        'Password must contain atleast one lowercase letter, one uppercase letter, one number, and one special character.'
    },
    custom: {
      options: (password: string, { req }) => {
        if (password !== req.body.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        return true;
      }
    }
  },
  email: {
    in: ['body'],
    optional: true,
    trim: true,
    escape: true,
    isEmail: true,
    errorMessage: 'Email is not valid'
  },
  privateProfile: {
    in: ['body'],
    optional: true,
    trim: true,
    escape: true,
    isBoolean: {
      errorMessage: 'Invalid privateProfile. Valid values: true, false.'
    }
  },
  topTracksTimeframe: {
    in: ['body'],
    optional: true,
    ...timeframeSchema
  },
  topTracksStyle: {
    in: ['body'],
    optional: true,
    ...styleSchema
  },
  topAlbumsTimeframe: {
    in: ['body'],
    optional: true,
    ...timeframeSchema
  },
  topAlbumsStyle: {
    in: ['body'],
    optional: true,
    ...styleSchema
  },
  topArtistsTimeframe: {
    in: ['body'],
    optional: true,
    ...timeframeSchema
  },
  topArtistsStyle: {
    in: ['body'],
    optional: true,
    ...styleSchema
  }
});

export default patchUserSettingsSchema;
