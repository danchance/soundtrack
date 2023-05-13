import { checkSchema } from 'express-validator';
import { timeframeSchema } from '../common.schema.js';

/**
 * Validation schema for the GET users/[username]/tracks endpoint.
 */
const getUserTracksSchema = checkSchema({
  username: {
    in: ['params'],
    trim: true,
    escape: true
  },
  timeframe: {
    in: ['query'],
    optional: true,
    ...timeframeSchema
  }
});

export default getUserTracksSchema;
