import { checkSchema } from 'express-validator';
import { timeframeSchema } from '../common.schema.js';

/**
 * Validation schema for the GET users/[username]/artists endpoint.
 */
const getUserArtistsSchema = checkSchema({
  username: {
    in: ['params'],
    trim: true,
    escape: true
  },
  limit: {
    in: ['query'],
    optional: true,
    trim: true,
    isInt: {
      options: {
        min: 10,
        max: 50
      }
    }
  },
  page: {
    in: ['query'],
    optional: true,
    trim: true,
    isInt: {
      options: {
        min: 1
      }
    }
  },
  timeframe: {
    in: ['query'],
    optional: true,
    ...timeframeSchema
  }
});

export default getUserArtistsSchema;
