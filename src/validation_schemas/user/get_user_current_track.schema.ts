import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET users/[userId]/current-track endpoint.
 */
const getUserCurrentTrackSchema = checkSchema({
  userId: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getUserCurrentTrackSchema;
