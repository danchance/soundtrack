type Keyable = {
  [key: string]: any;
};

type Config = {
  development: Keyable;
  test: Keyable;
  production: Keyable;
};

/**
 * Development config.
 */
const development = {
  serverPort: 8000,
  domain: 'http://localhost:8000',
  auth0: {
    audience: 'https://soundtrack/api',
    domain: 'https://soundtrack.uk.auth0.com/',
    jwksEndpoint: 'https://soundtrack.uk.auth0.com/.well-known/jwks.json',
    M2MApplication: {
      clientId: 'OUMe8qWZ5y62zxiJQjdtaC3Tr0VTNmMW'
    }
  },
  spotify: {
    apiUrl: 'https://api.spotify.com/v1',
    accountsUrl: 'https://accounts.spotify.com/api',
    clientId: '251e80c7b65e4e1797a529c3e8572dbd'
  }
};

/**
 * Test config.
 */
const test = {};

/**
 * Production config
 */
const production = {
  auth0: {
    audience: 'https://soundtrack/api',
    domain: 'https://soundtrack.uk.auth0.com/',
    jwksEndpoint: 'https://soundtrack.uk.auth0.com/.well-known/jwks.json'
  }
};

/**
 * Export the config based on the environment.
 */
const config: Config = {
  development,
  test,
  production
};

export default config[process.env.NODE_ENV as keyof Config];
