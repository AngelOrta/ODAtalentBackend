import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

if (process.env.INSTANCE_CONNECTION_NAME) {
  //Cloud Run usando socket unix
  dbConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
} else {
  //local
  dbConfig.host = process.env.DB_HOST; // ej. '127.0.0.1' o 'localhost'
  dbConfig.port = process.env.DB_PORT || 3306;
}

export const pool = mysql.createPool(dbConfig);