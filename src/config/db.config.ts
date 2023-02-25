import dotenv from 'dotenv';
dotenv.config();

export const devdb = {
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
