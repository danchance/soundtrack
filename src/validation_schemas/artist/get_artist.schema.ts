import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET artists/[artistSlug] endpoint.
 */
const getArtistSchema = checkSchema({
  artistSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getArtistSchema;
