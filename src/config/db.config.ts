import dotenv from 'dotenv';
dotenv.config();

type Keyable = {
  [key: string]: any;
};

type Config = {
  development: Keyable;
  test: Keyable;
  production: Keyable;
};

const development = {
  HOST: 'localhost',
  PORT: 3306,
  USER: 'root',
  PASSWORD: process.env.DB_PASSWORD,
  DB: 'soundtrack_dev',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

/**
 * Test config.
 */
const test = {};

/**
 * Production config.
 */
const production = {
  HOST: '127.0.0.1',
  PORT: 3306,
  USER: 'danchance',
  PASSWORD: process.env.DB_PASSWORD,
  DB: 'soundtrack',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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
