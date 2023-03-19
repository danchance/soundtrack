import config from '../config/general.config.js';
import { NextFunction, Request, Response } from 'express';
import jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

declare module 'jsonwebtoken' {
  export interface ExtendedJwtPayload extends jwt.JwtPayload {
    username: string;
  }
}

type DecodedJWTHeader = {
  alg: string;
  typ?: string;
  kid?: string;
};

/**
 * JSON Web Key Set endpoint, contains keys used to sign the Auth0
 * issued JWTs.
 */
const client = jwksClient({
  jwksUri: config.auth0.jwksEndpoint
});

/**
 * Get the signing key that matches the kid in the decoded JWT header.
 * @param header Decoded JWT header
 * @param callback
 */
const getKey = (header: DecodedJWTHeader, callback: Function) => {
  client.getSigningKey(header.kid, function (error, key) {
    if (error) return callback(error, null);
    const signingKey = key?.getPublicKey();
    return callback(null, signingKey);
  });
};

/**
 * Middleware function used to attach a user object to the request object.
 * User object is only added if a JWT exists and has a valid signature.
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express next() function
 * @returns Executes the next middleware in the stack
 */
const checkUser = (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization'];
  // No token included with request, so no logged in user
  if (typeof bearerHeader === 'undefined') return next();
  const bearer = bearerHeader.split(' ');
  let bearerToken = bearer[1];
  // Verify the JWT signature is valid
  jwt.verify(
    bearerToken,
    getKey,
    {
      algorithms: ['RS256'],
      audience: config.auth0.audience,
      issuer: config.auth0.domain
    },
    (error, decoded) => {
      if (error) return next();
      // Signature is valid, add user object
      const { sub, username } = decoded as jwt.ExtendedJwtPayload;
      req['user'] = {
        id: sub,
        username: username
      };
      return next();
    }
  );
};

export default checkUser;
