import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET tracks/[trackSlug] endpoint.
 */
const getTrackSchema = checkSchema({
  trackSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getTrackSchema;
