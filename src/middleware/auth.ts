import { auth } from 'express-oauth2-jwt-bearer';

/**
 * Authorization middleware. Verifies the access token provided
 * by Auth0.
 */
const checkJwt = auth({
  audience: 'https://soundtrack/api',
  issuerBaseURL: 'http://localhost:3000'
});

export default checkJwt;
