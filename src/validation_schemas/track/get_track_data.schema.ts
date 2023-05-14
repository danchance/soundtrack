import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET tracks/[trackSlug]/data endpoint.
 */
const getTrackDataSchema = checkSchema({
  trackSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getTrackDataSchema;
