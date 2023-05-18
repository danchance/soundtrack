import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET artists/[artistId]/albums endpoint.
 */
const getArtistAlbumsSchema = checkSchema({
  artistId: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getArtistAlbumsSchema;
