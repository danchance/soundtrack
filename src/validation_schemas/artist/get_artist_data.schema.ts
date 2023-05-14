import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET artists/[artistSlug]/data endpoint.
 */
const getArtistDataSchema = checkSchema({
  artistSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getArtistDataSchema;
