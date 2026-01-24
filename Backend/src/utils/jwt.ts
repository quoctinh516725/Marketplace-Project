import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { randomUUID } from "crypto";

export interface TokenData {
  userId: string;
  email: string;
  username: string;
  roles: string[];
  shopId?: string;
}

export interface DecodedToken extends TokenData {
  iat?: number;
  exp?: number;
  jti?: string;
}

export const generateAccessToken = (data: TokenData): string => {
  const secret = env.JWT_ACCESS_SECRET;
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN + "m";
  return jwt.sign({ ...data, jti: randomUUID() }, secret, {
    expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = env.JWT_REFRESH_SECRET;
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN + "d";
  return jwt.sign({ userId, jti: randomUUID() }, secret, {
    expiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (accessToken: string): DecodedToken => {
  try {
    const secret = env.JWT_ACCESS_SECRET;
    return jwt.verify(accessToken, secret) as DecodedToken;
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc hết hạn!");
  }
};

export const verifyRefreshToken = (refreshToken: string) => {
  try {
    const secret = env.JWT_REFRESH_SECRET;
    return jwt.verify(refreshToken, secret);
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc hết hạn!");
  }
};

export const getTokenRemainingTime = (accessToken: string): number => {
  const decoded = jwt.decode(accessToken) as DecodedToken;
  if (!decoded || !decoded.exp) {
    return 0;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingTime = decoded.exp - currentTime;
  return remainingTime > 0 ? remainingTime : 0;
};
