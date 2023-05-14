import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET artists/[artistId]/top-listeners endpoint.
 */
const getArtistTopListenersSchema = checkSchema({
  artistId: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getArtistTopListenersSchema;
