import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET users/[username]/track-history endpoint.
 */
const getUserTrackHistorySchema = checkSchema({
  username: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getUserTrackHistorySchema;
