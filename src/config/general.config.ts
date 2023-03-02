type Config = {
  development: any;
  test: any;
  production: any;
};

/**
 * Development config.
 */
const development = {
  serverPort: 8000,
  auth0: {
    audience: 'https://soundtrack/api',
    domain: 'https://soundtrack.uk.auth0.com'
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
    domain: 'https://soundtrack.uk.auth0.com'
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
