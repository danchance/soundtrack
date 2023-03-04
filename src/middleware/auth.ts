import { auth } from 'express-oauth2-jwt-bearer';
import config from '../config/general.config.js';

/**
 * Authorization middleware. Verifies the access token provided
 * by Auth0.
 */
const checkJwt = auth({
  audience: config.auth0.audience,
  issuerBaseURL: config.auth0.domain
});

export default checkJwt;
