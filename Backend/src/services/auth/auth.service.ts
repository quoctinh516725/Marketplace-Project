import { Request, Response } from "express";
import userRepository from "../../repositories/user.repository";
import { ConflictError, ValidationError } from "../../error/AppError";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { UserRole } from "../../constants";
import userRoleRepository from "../../repositories/userRole.repository";
import roleRepository from "../../repositories/role.repository";
import jwt, { JwtPayload } from "jsonwebtoken";
import refreshTokenRepository from "../../repositories/refreshToken.repository";
import { addUserCache } from "./auth.cache";
import { User } from "../../../generated/prisma/browser";

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
  login = async (data: LoginData): Promise<void> => {
    
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
    //Create User
    const newUser = await userRepository.create({
      ...data,
      password: password_hash,
    });
    //Gán role

    await userRoleRepository.assignRolesToUser(
      newUser.id,
      roles.map((r) => r.id),
    );
    //Sinh Access Token
    const accessToken = generateAccessToken({
      userId: newUser.id,
      email,
      username,
      roles: roles.map((r) => r.code),
    });
    //Sinh Refresh Token
    const refreshToken = generateRefreshToken(newUser.id);
    //Lưu Refresh Token vào DB
    const payload = jwt.decode(refreshToken) as JwtPayload;
    const expiredAt = new Date(payload.exp! * 1000);
    await refreshTokenRepository.create({
      userId: newUser.id,
      token: refreshToken,
      expiredAt,
    });
    //Cache thông tin user
    const { password: hiddenPassword, ...user } = newUser;
    await addUserCache({ ...user, roles: roles.map((r) => r.code) });
    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl,
        status: newUser.status,
      },
      accessToken,
      refreshToken,
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
