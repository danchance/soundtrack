import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET users/[username]/info endpoint.
 */
const getUserInfoSchema = checkSchema({
  username: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getUserInfoSchema;
