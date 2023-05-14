import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET albums/[albumId]/data endpoint.
 */
const getAlbumsDataSchema = checkSchema({
  albumSlug: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getAlbumsDataSchema;
