import { Request, Response } from "express";
import userRepository from "../../repositories/user.repository";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../../error/AppError";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenRemainingTime,
} from "../../utils/jwt";
import { UserRole } from "../../constants";
import userRoleRepository from "../../repositories/userRole.repository";
import roleRepository from "../../repositories/role.repository";
import jwt, { JwtPayload } from "jsonwebtoken";
import refreshTokenRepository from "../../repositories/refreshToken.repository";
import { addUserCache } from "./auth.cache";
import { prisma } from "../../config/prisma";

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  login = async (data: LoginData): Promise<AuthResponse> => {
    const { emailOrUsername, password } = data;
    // Check exist
    const user = await userRepository.existEmailOrUsername(emailOrUsername);
    if (!user)
      throw new UnauthorizedError("Email hoặc Username không tồn tại!");

    // Compare Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ConflictError("Password không hợp lệ!");

    //Get roles for generate token
    const roles = await userRoleRepository.findRolesByUser(user.id);

    //Get accessToken
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      roles,
    });

    //Get ttl for Add Cache
    const { password: hash_password, ...userCache } = user;
    const ttl = getTokenRemainingTime(accessToken);

    // Add cache
    await addUserCache({ ...userCache, roles }, ttl);

    //Get refresh token
    const refreshToken = generateRefreshToken(user.id);

    //Get expiredAt for Create refreshToken
    const decoded = jwt.decode(refreshToken) as JwtPayload;
    const expiredAt = new Date(decoded.exp! * 1000);

    const result = await prisma.$transaction(async (tx) => {
      // Update lastLoginAt
      await userRepository.update(tx, user.id, { lastLoginAt: new Date() });

      // Revoke All RefreshToken
      await refreshTokenRepository.revokeAllRefreshToken(tx, user.id);

      //Create refresh token DB
      await refreshTokenRepository.create(tx, {
        userId: user.id,
        token: refreshToken,
        expiredAt,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
        accessToken,
        refreshToken,
      };
    });
    return result;
  };
  register = async (data: RegisterData): Promise<AuthResponse> => {
    const { email, username, password } = data;

    //Check exist email
    const existEmail = await userRepository.existEmail(email);
    if (existEmail) {
      throw new ConflictError("Email đã tồn tại!");
    }

    //Check username
    const existUsername = await userRepository.existUsername(username);
    if (existUsername) {
      throw new ConflictError("Username đã tồn tại!");
    }

    //Hash Password
    const salt = 10;
    const password_hash = await bcrypt.hash(password, salt);

    //Check Role
    const roleCodes = [UserRole.USER]; // Khởi tạo Role là User
    const roles = await roleRepository.validateRoles(roleCodes);
    if (!roles) {
      throw new ValidationError("Role được gán không tồn tại!");
    }

    const result = await prisma.$transaction(async (tx) => {
      //Create User
      const newUser = await userRepository.create(tx, {
        ...data,
        password: password_hash,
      });

      //Gán role
      await userRoleRepository.assignRolesToUser(
        tx,
        newUser.id,
        roles.map((r) => r.id),
      );

      //Sinh Refresh Token
      const refreshToken = generateRefreshToken(newUser.id);
      const decoded = jwt.decode(refreshToken) as JwtPayload;
      const expiredAt = new Date(decoded.exp! * 1000);
      //Lưu Refresh Token vào DB
      await refreshTokenRepository.create(tx, {
        userId: newUser.id,
        token: refreshToken,
        expiredAt,
      });
      return {
        newUser,
        refreshToken,
      };
    });

    //Sinh Access Token
    const accessToken = generateAccessToken({
      userId: result.newUser.id,
      email,
      username,
      roles: roles.map((r) => r.code),
    });

    //Cache thông tin user
    const ttl = getTokenRemainingTime(accessToken);
    const { password: hiddenPassword, ...user } = result.newUser;
    await addUserCache({ ...user, roles: roles.map((r) => r.code) }, ttl);
    return {
      user: {
        id: result.newUser.id,
        username: result.newUser.username,
        email: result.newUser.email,
        fullName: result.newUser.fullName,
        avatarUrl: result.newUser.avatarUrl,
        status: result.newUser.status,
      },
      accessToken,
      refreshToken: result.refreshToken,
    };
  };
  refreshToken = async (
    refreshToken: string,
  ): Promise<{ accessToken: string }> => {
    return { accessToken: "123" };
  };
  logout = async (req: Request, res: Response): Promise<void> => {
    console.log(123);
  };
}

export default new AuthService();
