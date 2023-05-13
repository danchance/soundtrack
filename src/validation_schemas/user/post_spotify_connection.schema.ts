import { checkSchema } from 'express-validator';

/**
 * Validation schema for the POST users/spotify endpoint.
 */
const postSpotifyConnectionSchema = checkSchema({
  code: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Code is required.'
  },
  redirectUri: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Redirect URI is required.'
  }
});

export default postSpotifyConnectionSchema;
