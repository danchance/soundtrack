import { checkSchema } from 'express-validator';

/**
 * Validation schema for the GET albums/[albumId]/tracks endpoint.
 */
const getAlbumsTracksSchema = checkSchema({
  albumId: {
    in: ['params'],
    trim: true,
    escape: true
  }
});

export default getAlbumsTracksSchema;
