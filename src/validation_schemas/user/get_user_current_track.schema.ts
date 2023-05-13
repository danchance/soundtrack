import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET users/[userid]/current-track endpoint.
 */
const getUserCurrentTrackSchema = checkSchema({
  userid: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getUserCurrentTrackSchema;
