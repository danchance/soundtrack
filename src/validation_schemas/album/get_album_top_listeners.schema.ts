import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET albums/[albumId]/top-listeners endpoint.
 */
const getAlbumsTopListenersSchema = checkSchema({
  albumId: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getAlbumsTopListenersSchema;
