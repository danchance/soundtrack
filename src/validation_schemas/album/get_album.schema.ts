import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET albums/[albumSlug] endpoint.
 */
const getAlbumSchema = checkSchema({
  albumSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getAlbumSchema;
