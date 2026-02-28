import dotenv from "dotenv";
dotenv.config();

function required(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Thiếu biến môi trường ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: required("DB_PASSWORD"),
  DB_NAME: required("DB_NAME"),
  HOST: required("HOST"),

  PORT: required("PORT"),
  FRONTEND_URL: required("FRONTEND_URL"),
  REDIS_URL: required("REDIS_URL"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: required("JWT_ACCESS_EXPIRES_IN"),
  JWT_REFRESH_EXPIRES_IN: required("JWT_REFRESH_EXPIRES_IN"),

  ES_URL: required("ES_URL"),

  NODE_ENV: required("NODE_ENV"),
  CLOUDINARY_URL: required("CLOUDINARY_URL"),
};
